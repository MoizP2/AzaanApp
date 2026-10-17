# Azaan app (free, installs on your phone)

## Files
- `index.html`, `app.js`: the app
- `sw.js`: lets it work offline and pick up updates
- `manifest.json`, `icon.svg`: home-screen install info
- `azaan.mp3`: **you add this.** Use any azaan recording you have the right to use, saved as `azaan.mp3` in this folder.

## Put it online for free (GitHub Pages)
1. Make a free account at github.com.
2. Create a new public repository (e.g. `azaan`).
3. Upload all these files to it (drag and drop on the repo page works).
4. Go to Settings > Pages, choose branch `main`, folder `/ (root)`, and save.
5. After a minute you get a link like `https://YOUR-NAME.github.io/azaan/`.

## Install on your phone
- **Android (Chrome):** open the link, menu (three dots) > "Add to Home screen" or "Install app".
- **iPhone (Safari):** open the link, Share button > "Add to Home Screen".
- Open the app from its icon, tap **Enable sound & alerts**, and allow notifications.

## Updating
Edit the files on your computer, then upload them again to GitHub (or use `git push` if you use Git). The phone gets the new version the next time it opens the app while online.

## Important limits
- Prayer times come from the Aladhan API using your location (or Mississauga if you deny location). It needs internet once a day; the last times are saved for offline use.
- Phones don't let a web app play sound in the background. **The app must be open on the screen (or the screen awake) at prayer time.** The "Enable" button keeps the screen awake while the app is open. For a true background alarm that plays with the phone locked, a native app is needed.
- Times use ISNA calculation (`METHOD = 2` in `app.js`). If your local masjid uses a different method, change that number.
