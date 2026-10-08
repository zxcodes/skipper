# Skipper

A zero-config Chrome extension that auto-clicks Crunchyroll's **Skip Intro**, **Skip Recap**, **Skip Preview**, and **Skip Credits** buttons the moment they appear.

## Install

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Play any episode on Crunchyroll — skips happen automatically

## How it works

A content script watches the player DOM with a `MutationObserver` (plus a 1.5s polling backstop) and clicks any element whose `data-testid` contains `skip` — e.g. `skip-intro-button`, `skip-ending-button`, `skipIntroText`. A fallback matches button labels/aria-labels across ~18 languages in case Crunchyroll renames their testids.

Notes:

- Runs on `*.crunchyroll.com` including the `static.crunchyroll.com` player iframe
- Ignores opacity (Crunchyroll fades the button in but it's clickable immediately) and skips "skip to content" a11y links
- No permissions, no UI, no network calls, no tracking
- Resets on SPA navigation so every new episode skips fresh

## Dev

`test/test.html` is a local harness that reproduces the known button variants. Serve the repo root (`python3 -m http.server`) and open `http://localhost:8000/test/test.html`.
