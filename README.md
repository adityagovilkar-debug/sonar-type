# Sonar Type

Typing defence on a sonar screen. Words close in from the edge of the scope; type them before they reach the core.
Every letter fires a tracer, and the score rewards hard words, fast typing and distant kills.

## Modes and progression

- **Sector**: three waves, then the leviathan. Medals for accuracy and hull left.
- **Patrol**: endless; the threat level climbs with every ten words destroyed.
- **Expedition**: a sea chart of branching routes (open water, calm passages, dangerous routes, wreck fields,
  storm fronts, one harbour). Four legs, then the lair at the end of your route: the Siren (layers typed
  backwards), the Leviathan, or the Ironback (every layer typed twice). Hull, arsenal and modules carry over.
- **Upgrade cards**: after every wave (every threat level in patrol) pick one of three modules; each one bolts a
  visible part onto the hull for the rest of the run.
- **Salvage and the Dry Dock**: every run banks a hundredth of its score as salvage, spent on hulls (Skiff,
  Bastion, Wraith, Lancer, Choir), arsenal variants (Swarm, Harpoon, Freeze, Shockwave, Depth charge) and rare
  cards. Tracer styles come with hulls or are earned with medals.
- **Pressure**: switches unlocked by clearing sectors (Deep water, Fragile, Typo tax, Blackout, Bare hull) that
  make a run harder and multiply its score.

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
