# Project Highlands

**Project Highlands** is an original browser-based, first-person 3D wilderness adventure inspired by high-altitude mountain exploration. It uses Three.js and JavaScript, so you can play it in a modern desktop browser without installing Unity.

## Play online

After GitHub Pages is enabled for this repository, the game will be available at:

**https://edwardoke.github.io/Project-Highlands/**

The included GitHub Actions workflow deploys the site from the `main` branch. On GitHub, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source if it is not already selected. Then open **Actions** to monitor the deployment. The first deployment may take a few minutes.

You can also run it locally without installing Unity. Because the game loads JavaScript modules, serve the repository through a local web server rather than opening `index.html` directly. For example, with Python installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Browser prototype features

- First-person mouse look and pointer-lock controls
- WASD movement, sprinting, jumping and stamina
- Procedurally sculpted valley terrain, distant mountain ridges, fog and sunlight
- Instanced evergreen forest, scattered rocks, river and small cabins
- Three glowing signal fragments to find and collect
- Responsive HUD with objective progress, stamina and compass
- Lightweight geometry designed for browser rendering

## Controls

| Input | Action |
|---|---|
| Click **Enter the Highlands** | Start and capture mouse |
| W / A / S / D | Move |
| Mouse | Look around |
| Left Shift | Sprint |
| Space | Jump |
| E | Collect a nearby signal fragment |
| Esc | Release mouse pointer |

## Project files

- `index.html` — game interface, HUD and intro screen
- `game.js` — Three.js scene, procedural environment and gameplay
- `Assets/Scripts/` — earlier Unity/C# prototype scripts, kept for reference

## Notes

This is an early playable prototype, not a complete commercial open-world game. Three.js is loaded from jsDelivr, and fonts are loaded from Google Fonts, so an internet connection is needed for those resources. The environment is generated from original code and primitive geometry; no Far Cry game code or proprietary assets are included.

## Roadmap

1. Expand the valley and add better terrain materials
2. Add wildlife, patrols and interactive outposts
3. Add mission chains, inventory and a save system
4. Add environmental audio and performance settings
5. Improve mobile support and accessibility

No license has been selected yet. Only add third-party assets you have permission to use.
