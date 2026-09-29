# দৌড়ের উপর — City Runner

## [▶ ওয়েবসাইটে খেলো / Play the game](https://mdmortuzahossain.github.io/city-runner/)

A browser endless runner set on an illustrated city street. A human runner jumps over potholes and fallen bicycles. Miss a jump and the runner reacts with **“কুত্তার বাচ্চা!”** or **“ছাগলের বাচ্চা!”**.

## Controls

- **Space / Up arrow:** start, jump, or retry
- **Tap the game canvas / jump button:** touch controls
- **P / pause button:** pause and resume
- **Sound button:** toggle sound effects and speech
- Switching tabs pauses the run automatically

## Features

- Original animated human character and scrolling city artwork, drawn in Canvas
- Alternating potholes and fallen bicycles with fair gaps between obstacles
- Increasing speed with a fixed maximum, distance, score, and obstacle count
- 25 bonus points for each obstacle cleared
- Best score and sound preference saved locally when browser storage is available
- Original synthesized jump and collision sound effects using Web Audio
- Bengali reactions displayed on every collision

**Speech:** Spoken reactions use the browser's Web Speech API and require an available Bengali voice. If there is no Bengali voice, the reaction text and collision effect still work. Expand the audio help to see availability and test the voice. Voice availability and pronunciation depend on the browser and operating system. No microphone access is used.

All game logic and visual artwork were created for this project. No third-party game library, downloaded character art, or Chrome Dinosaur source code is included. Browser APIs and system fonts are used.

## Development

Serve this folder with any static HTTP server. No install or build is required. ES modules need HTTP, so opening `index.html` directly from disk is not supported.

Run `node --test tests.mjs` to check collision handling, jumping, jump buffering, pause, scoring, frame-rate consistency, and a simulated three-minute run through both obstacle types at maximum speed.

GitHub Pages publishes `main` from the repository root.
