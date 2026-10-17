// Prayer times from the free Aladhan API (no key needed).
// METHOD 2 = ISNA, common in North America. Change it if your local mosque uses another method.
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const METHOD = 2;
const FALLBACK_CITY = { city: 'Mississauga', country: 'Canada' }; // used if location is denied
const CACHE_KEY = 'azaan-times';

const $ = id => document.getElementById(id);
const player = $('player');
let times = null;          // { date, Fajr: "05:12", ... }
let lastDate = '';
const fired = new Set();   // "YYYY-MM-DD Prayer" so each azaan plays once per day

const pad = n => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const setStatus = msg => { $('status').textContent = msg; };

async function fetchTimes() {
  const date = todayStr();
  let url;
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
    url = `https://api.aladhan.com/v1/timings/${date}?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=${METHOD}`;
  } catch {
    url = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${FALLBACK_CITY.city}&country=${FALLBACK_CITY.country}&method=${METHOD}`;
  }
  const res = await fetch(url);
  const json = await res.json();
  const t = json.data.timings;
  const result = { date, ...Object.fromEntries(PRAYERS.map(p => [p, t[p].slice(0, 5)])) };
  localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  return result;
}

async function loadTimes(force = false) {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (!force && cached && cached.date === todayStr()) {
    times = cached;
  } else {
    try {
      times = await fetchTimes();
      setStatus('');
    } catch {
      times = cached;
      setStatus(cached ? 'Offline: using saved times' : 'Could not get prayer times. Check Wi-Fi.');
    }
  }
  lastDate = todayStr();
  renderTimes();
}

function renderTimes() {
  $('times').innerHTML = PRAYERS.map(p =>
    `<tr data-p="${p}"><td>${p}</td><td>${times ? times[p] : '--:--'}</td></tr>`).join('');
}

function nextPrayer() {
  const n = nowMin();
  const p = PRAYERS.find(name => toMin(times[name]) > n);
  if (p) return { name: p, in: toMin(times[p]) - n };
  return { name: 'Fajr', in: toMin(times.Fajr) + 1440 - n };
}

function tick() {
  const now = new Date();
  $('clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // New day: fetch fresh times
  if (todayStr() !== lastDate) loadTimes(true);
  if (!times) return;

  const next = nextPrayer();
  const h = Math.floor(next.in / 60), m = next.in % 60;
  $('next').textContent = `Next: ${next.name} in ${h ? h + 'h ' : ''}${m}m`;

  document.querySelectorAll('#times tr').forEach(row =>
    row.classList.toggle('active', row.dataset.p === next.name));

  // Fire azaan when the current minute matches a prayer time
  const current = nowMin();
  PRAYERS.forEach(p => {
    const key = todayStr() + ' ' + p;
    if (current === toMin(times[p]) && !fired.has(key)) {
      fired.add(key);
      playAzaan(p);
    }
  });
}

function playAzaan(name) {
  setStatus(`It's time for ${name}`);
  player.currentTime = 0;
  player.play().catch(() =>
    setStatus('Tap "Enable sound & alerts" so the phone allows the azaan to play.'));
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`${name}: time for prayer`, { body: 'Allahu Akbar' });
  }
}

async function keepAwake() {
  try { await navigator.wakeLock.request('screen'); } catch { /* not supported */ }
}

$('enable').onclick = async () => {
  // Unlock audio on iOS/Android with a user tap
  player.play().then(() => player.pause()).catch(() => {});
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  keepAwake();
  setStatus('Sound and alerts enabled. Keep this app open on the screen.');
};

$('test').onclick = () => playAzaan('Test');
$('refresh').onclick = () => loadTimes(true);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepAwake();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

loadTimes();
setInterval(tick, 1000);
tick();
