# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start       # Start dev server (localhost:3000)
npm test        # Run tests in watch mode
npm test -- --watchAll=false  # Run tests once (CI mode)
npm run build   # Production build
```

To run a single test file:
```bash
npm test -- App.test.js
```

## Architecture

This is a Create React App project with a single-component structure. The entire app lives in `src/App.js` — a stopwatch with start/pause, lap recording, and reset functionality.

- **State**: `time` (ms), `running` (bool), `laps` (array of ms values) managed with `useState`
- **Timer**: driven by `setInterval` in a `useEffect` that reacts to `running` state; ref (`intervalRef`) holds the interval ID for cleanup
- **Rendering**: `src/index.js` mounts `<App>` into `#root` inside `React.StrictMode`
- **Styles**: `src/App.css` (component styles), `src/index.css` (global styles)
- **Tests**: `@testing-library/react` + `@testing-library/jest-dom`; test file is `src/App.test.js`
