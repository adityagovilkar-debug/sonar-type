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
- **Leviathans**: four kinds, each with its own attack. The Leviathan lunges, the Archerfish fires short words
  at the hull, the Siren circles and sings (speeding up everything else), the Ironback is plated and its broken
  plates fly at you. Sectors rotate through them; expeditions end at one of three.
- **Retargeting**: start typing a clearly more dangerous word and the lock jumps to it; Backspace drops the lock.
- **Adaptive words + Drill**: every letter's speed and accuracy is remembered; words lean towards your weakest
  letters, and Drill is 90 seconds of no-damage practice built from them.
- **Logbook** (L): speed and accuracy charts across runs, week by week, a keyboard heatmap, and the story.
- **Story**: *The Drowned Archive*, told in station logs unlocked by clearing sectors and beating leviathans.
- **Cosmetics**: scope colours, kill effects and tracer styles in the Dry Dock.
- **Pressure**: switches unlocked by clearing sectors (Deep water, Fragile, Typo tax, Blackout, Bare hull) that
  make a run harder and multiply its score.

- **The Archive** (v4.3): every word typed out is recovered into a catalogue (Logbook → Archive), rare gold
  **relic** words carry catalogue cards, a **bestiary** records every kind of contact met, 44 **commendations**
  pay salvage once each, and an **Operator rank** grows with all the salvage ever banked.

- **New water** (v4.4): **Descent** (endless dive; Sunlit, Twilight, Midnight, Abyss and Hadal zones every
  200 m) replaces Patrol on the title; a **Daily dive** (seeded sector with a daily twist, one counted attempt,
  a streak); **Zen** (no hull, no weapons); and six new contacts: allies (do not fire), krill swarms, mimics,
  divers, wardens and fading words.

- **Combat depth** (v4.5): a hull **ability** on key 1 (Breath, Brace, Phase out, Overdrive, Chorus); **flow**
  (fast clean words fill a meter; full, it scores ×1.25); **parry** (type a leviathan's shot within a second and it
  flies back); a **ghost** of your best run in the Score panel; **hull mastery** (levels 1–5: trims, a perk,
  a stronger ability); **expedition tiers** 1–5, each adding a modifier and +20% score and salvage.

- **Training & comfort** (v4.6): a **Settings** screen (O) with assist speed (records marked assisted), larger
  text, a colour-blind palette, an easy-read font, an optional 30 s **warm-up** on weak letters, and keyboard
  layouts (QWERTY, QWERTZ, AZERTY, Dvorak, Colemak). The Logbook adds letter **pairs**, a **finger map** and
  hands summary, and a **weekly goal** (speed, accuracy, minutes or runs).

- **Campaign** (v4.7): *The Last Word*, ten missions from Pelagia down to the Archive, each with an objective
  (destroy, hold out, escort allies, recover relics, dive) and sometimes a leviathan after it. Finishing earns a
  star and two marks earn one each (30 in all); a pace setting shifts every mission's threat level. The finale
  is the Archive itself, speaking in each leviathan's voice, and ends with a choice typed like any other word
  (two endings, each with its own log and scope colour). The **Gauntlet** mode is all four leviathans back to
  back, with medals per difficulty; it opens once each leviathan has been destroyed.

## Tests

`tests/` drives the game in headless Edge with a throwaway profile, so no real save is touched.
Serve `game/` (`python -m http.server 8420 --directory game`), then for example:
`node tests/run.cjs tests/archive.cjs` (checks + simulated runs) or `node tests/run.cjs tests/shots-archive.cjs`
(screenshots). `node tests/packaged.cjs` smoke-tests the built app after `npm run dist`.

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
