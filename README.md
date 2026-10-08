# Sonar Type

Typing defence on a sonar screen. Words close in from the edge of the scope; type them before they reach the core.
Every letter fires a tracer, and the score rewards hard words, fast typing and distant kills.

## Layout

| Path | What it is |
|---|---|
| `game/index.html` | The whole game: a single HTML file (canvas + Web Audio, no dependencies) |
| `game/words.js` | The word bank (`window.WORD_BANK`, five length tiers) |
| `main.js`, `preload.js` | Electron shell: frameless window, window controls, single instance |
| `build/` | Icons (`make_icon.py` regenerates `icon.png`) |
| `docs/` | Design mockups and screenshots from each version |

## Run

- In a browser: serve `game/` over http (for example `python -m http.server 8420 --directory game`) and open `http://localhost:8420/`.
  Opening the file directly also works in most browsers.
- As the desktop app: `npm install`, then `npm start`.

## Build the installer

`npm run dist` writes `dist/Sonar-Type-Setup-<version>.exe`: an install wizard that adds desktop and Start menu shortcuts.
Installing a newer version upgrades in place and keeps save data (stored by the app under `%APPDATA%\Sonar Type`).
