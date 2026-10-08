# Aman Tiwari — Portfolio

3D portfolio built with React, Three.js (React Three Fiber + drei), GSAP, Lenis and Framer Motion.

Live: https://aman-tiwari18.github.io/user-profile/

## Develop

```bash
npm install
npm run dev
```

Source lives in `site/`.

## Deploy

GitHub Pages serves the `main` branch root, so the production build is committed there:

```bash
npm run build   # writes index.html + assets/ to the repo root
git add -A && git commit -m "Deploy" && git push
```

The previous version of the site is kept in `legacy/`.
