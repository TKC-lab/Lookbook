# Fit Check

A mobile-first **Progressive Web App** that turns your phone into a digital wardrobe. Save product images from any website, build outfits by swiping through your clothes, and save your favourite looks.

- 🖼️ Add items from website screenshots — backgrounds removed automatically
- 🧺 Filterable wardrobe grid (Tops / Bottoms / Shoes)
- 👕 Swipeable outfit builder (one card stack per category)
- 💾 Save looks with a name and occasion tag
- ✏️ Edit and reorder saved outfits
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

---

## Build

```bash
npm run build      # outputs static site to ./dist
npm run preview    # serve the production build locally
```

If you ever need to regenerate the app icons, run `node scripts/gen-icons.mjs`.

---

## Deploy to GitHub Pages

Pushes to `main` automatically build and deploy via GitHub Actions. The workflow sets `VITE_BASE=/fitcheck/` to match the repo name.

To deploy manually or from a fork, update `VITE_BASE` in `.github/workflows/deploy.yml` to match your repo name.

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
    image.js           # resize, compress, and background removal
    seed.js            # first-run starter wardrobe
  components/
    BottomNav.jsx      # 4-tab bottom navigation
    SwipeStack.jsx     # swipeable card stack for one category
    Sheet.jsx          # bottom-sheet modal
    icons.jsx          # inline SVG icons
  screens/
    Wardrobe.jsx       # grid + add-item flow
    Builder.jsx        # outfit builder + save flow
    Outfits.jsx        # saved looks with edit + drag reorder
    Settings.jsx       # stats + clear data
scripts/
  gen-icons.mjs        # regenerates PWA PNG icons
```

## Notes & limits

- Images are stored as base64 PNG in `localStorage`. The browser quota is ~5 MB — the app will warn you when it's full.
- Deleting a wardrobe item also removes it from any saved outfit that used it.
- Background removal uses a canvas flood-fill algorithm — works best on product images with solid or near-solid backgrounds.
