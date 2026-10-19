# Project Highlands

An original Unity/C# first-person open-world adventure prototype for Windows PC, inspired by Himalayan wilderness exploration. This project does not use proprietary Far Cry code or assets.

## Prototype features
- First-person WASD movement, mouse look, sprinting and jumping
- Generated starter valley with mountain silhouettes, pine-like trees, rocks and a river
- Directional sunlight, atmospheric fog and a simple day/night cycle
- Unity editor tool to generate the starter scene

## Setup
1. Install Unity Hub and a current Unity 3D LTS editor with Windows Build Support.
2. Open this repository as a Unity project.
3. Wait for scripts to compile.
4. In Unity, choose Project Highlands > Build Prototype Scene.
5. Press Play.

Controls: WASD move, mouse look, Left Shift sprint, Space jump, Escape release/relock cursor.

## Current layout
- Assets/Scripts/Player — movement
- Assets/Scripts/World — atmosphere
- Assets/Scripts/Editor — scene generator
- Assets/Scenes — generated scenes

## Unity project configuration
This repository is currently the source-code foundation. Unity's ProjectSettings and Packages/manifest.json are also needed for a complete project. If these are absent, create a temporary 3D project in Unity Hub and copy those folders into this repository, preserving its Assets folder.

## Roadmap
1. Playable valley prototype
2. Sculpted terrain, ground materials and optimized vegetation
3. Wildlife and NPC AI
4. Missions and outposts
5. Audio, UI, saving and Windows builds

No license has been selected. Add third-party assets only when you have permission to use them.
