# dat-2k2.github.io

Personal site of Nguyen Quoc Dat — https://dat-2k2.github.io

Hand-written static HTML/CSS/JS, no build step. GitHub Pages serves the `main` branch root.

```
index.html      the one-page site
styles.css      tokens (light/dark), type scale, layout
script.js       theme toggle, scroll reveal, footer year
fonts/          Geist + Geist Mono (variable, latin subset, self-hosted)
design/         Figma exports (desktop 1440 / mobile 390, light + dark), Mobbin references, review log
tests/          Playwright + axe-core check of the live site → review/
review/         latest live-site screenshots and results
```

Design file: https://www.figma.com/design/Kq03FAdHeFmKwMrmS74gM9

Run the live-site checks:

```
cd tests && npm install && npm run check
# or against a local server:  BASE_URL=http://127.0.0.1:8765 npm run check
```
