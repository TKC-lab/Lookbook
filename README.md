# Lookbook

A mobile-first **Progressive Web App** that turns your phone into a digital closet. Photograph your clothes, organise them into Tops / Bottoms / Shoes, then swipe through your wardrobe to build and save outfits.

- 📷 Add items by camera or photo upload
- 🧺 Filterable wardrobe grid
- 👕 Swipeable outfit builder (one card stack per category)
- 💾 Save looks with a name and occasion tag
- 📱 Installable PWA with offline support — no backend, no accounts
- 🔒 All data lives in `localStorage` on your device

Built with React + Vite + Tailwind. Optimised for a 390px (iPhone) viewport.

---

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL on your phone (same Wi-Fi) or in your browser's device-emulation mode at 390px width.

> The camera capture (`capture="environment"`) only opens the rear camera on a real mobile device. On desktop it falls back to a normal file picker.

---

## Build

```bash
npm run build      # outputs static site to ./dist
npm run preview    # serve the production build locally
```

A single `npm run build` produces a fully static site in `dist/`, ready for GitHub Pages.

If you ever need to regenerate the app icons, run `node scripts/gen-icons.mjs`.

---

## Deploy to GitHub Pages

This app is served from a **project page** at `https://<your-username>.github.io/<repo-name>/`, so the build needs the right base path.

### 1. Set the base path

The base path must match your repository name. It defaults to `/lookbook/`. If your repo has a different name, override it at build time:

```bash
VITE_BASE=/your-repo-name/ npm run build
```

(Or edit the default in [`vite.config.js`](vite.config.js).)

### 2. Build

```bash
npm run build
```

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "Lookbook PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 4. Enable GitHub Pages

You have two easy options:

**Option A — publish the `dist` folder via the `gh-pages` branch (recommended)**

```bash
npm install --save-dev gh-pages
npx gh-pages -d dist
```

Then in your repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, and pick the `gh-pages` branch with the `/ (root)` folder.

**Option B — publish from a `docs/` folder on `main`**

```bash
# build into docs instead of dist
rm -rf docs && npm run build && mv dist docs
git add docs && git commit -m "Publish to docs" && git push
```

Then: **Settings → Pages → Source: Deploy from a branch → `main` → `/docs`**.

Give it a minute, then visit `https://<your-username>.github.io/<repo-name>/`.

---

## Add to Home Screen

On the deployed (HTTPS) site:

- **iOS Safari:** Share → *Add to Home Screen*
- **Android Chrome:** menu → *Install app* / *Add to Home screen*

Once installed it launches full-screen with no browser chrome.

---

## Project structure

```
src/
  App.jsx              # app shell + state, owns localStorage sync
  lib/
    storage.js         # CRUD for wardrobe items & saved outfits
    image.js           # downscale/compress photos to base64
  components/
    BottomNav.jsx      # 4-tab bottom navigation
    SwipeStack.jsx     # swipeable card stack for one category
    Sheet.jsx          # bottom-sheet modal
    icons.jsx          # inline SVG icons
  screens/
    Wardrobe.jsx       # grid + add-item flow
    Builder.jsx        # outfit builder + save flow
    Outfits.jsx        # saved looks
    Settings.jsx       # stats + clear data
scripts/
  gen-icons.mjs        # regenerates PWA PNG icons
```

## Notes & limits

- Photos are downscaled to ~900px JPEG before being stored as base64 to stay within the browser's ~5 MB `localStorage` quota. If you hit the limit, the app tells you to delete some items.
- Deleting a wardrobe item also removes it from any saved outfit that used it (the outfit card shows "Item removed" if a slot is gone).
