# The Ritual — macOS App

A daily consistency tracker that **pops up automatically every time you log in** to your Mac.

---

## What it does

- **Auto-launches on login** — opens instantly when you start your Mac
- **Daily commitment popup** — asks "What will you commit to today?" each morning  
- **Lives in your menu bar** — unobtrusive, always accessible  
- **Tracks your streak** — 35-day calendar heatmap, completion rate, day count
- **Daily reflection journal** — log what you noticed each day
- **All data stored locally** — private, no accounts, no internet required

---

## Build the DMG (takes ~2 minutes)

### Prerequisites
- macOS (any recent version)
- [Node.js](https://nodejs.org) v18 or later

### Steps

```bash
# 1. Open Terminal and navigate to this folder
cd path/to/ritual-app

# 2. Install dependencies
npm install

# 3. Build the macOS DMG
npm run dist
```

Your DMG will appear in `dist/The Ritual-1.0.0.dmg`

### Install
1. Open the DMG
2. Drag **The Ritual** → **Applications**
3. Open it from Applications
4. It will ask permission to launch at login — click Allow

---

## App behavior

| Situation | What happens |
|-----------|-------------|
| Mac starts up | App silently launches, popup appears |
| You set commitment | App moves to main tracker view |
| You click Skip | App goes to tracker without commitment |
| You click Close (×) | Window hides, app stays in menu bar |
| You click menu bar icon | Window toggles open/closed |
| Right-click menu bar icon | Shows options including Quit |

---

## Disable auto-launch

Right-click the menu bar icon → **Disable Auto-Launch**

Or remove it from: **System Settings → General → Login Items**

---

## Development (run without building)

```bash
npm install
npm start
```

---

## Tech stack

- **Electron** — native macOS app wrapper  
- **auto-launch** — login item registration  
- **electron-store** — local data persistence  
- **Pure HTML/CSS/JS** — no frontend framework needed
