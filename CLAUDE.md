# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A one-page freelance portfolio/landing site for Axel Salomon (developer), built with **plain HTML, CSS and JavaScript — no frameworks, no build tools, no package.json**. It's static and deployed as-is to GitHub Pages.

## Running locally

No install step. Either:
- Open `index.html` directly in a browser, or
- `python3 -m http.server 8000` from the project root and visit `http://localhost:8000`

There is no build, lint, or test tooling in this repo — there's nothing to compile and no test suite to run.

## File structure

```
index.html                          → all markup/content, one page, section by section
assets/css/styles.css               → all styles (single file, mobile-first)
assets/js/script.js                 → all interactivity (single file)
assets/img/                         → logo + favicons
```

`styles.css` has a numbered index in its header comment (design tokens, reset, background, nav, hero, services, portfolio, "why me", CTA/form, footer, cursor light, reveal animations, WhatsApp button, breakpoints) — check it before searching blindly.

## Architecture notes

- **Mobile-first CSS**: base styles target mobile; `min-width` media queries at 768px (tablet) and 1024px/1280px (desktop) layer on top. Don't write desktop-first overrides.
- **`script.js` structure**: top-level statements (mobile menu, smooth scroll, reveal observer, stat counters, portfolio filters, demo-link warning, contact form submit) run immediately on load; the WhatsApp float, canvas particle animation, and cursor glow are each wrapped in their own IIFE further down the file, since they carry private state/config.
- **Stat counters degrade gracefully**: the `.stat-number` elements in `index.html` start with their real final value already in the markup (e.g. `11+`) instead of `0` — `animateCounters()` in `script.js` only replaces that text once its `IntersectionObserver` actually fires, so a visitor never sees a bare "0" if JS is slow, disabled, or the observer never triggers.
- **Cache-busting convention**: `index.html` loads CSS/JS with a `?v=N` query param (e.g. `styles.css?v=2`). Whenever you edit `styles.css` or `script.js`, bump that version number in `index.html`, or GitHub Pages/browsers may serve a stale cached copy.
- **Portfolio grid**: each project is a `<div class="portfolio-card" data-cat="...">` block in `index.html` under `#portfolio` (annotated with `<!-- Proyecto N: ... -->` comments). Filtering by category is done client-side in `script.js` by toggling `display` based on `data-filter` matching `data-cat`.
- **Demo vs. live links**: portfolio links to Netlify-hosted mockups carry `data-demo="true"` and get an intercepted `confirm()` warning (no real backend behind them) before opening; links to real client domains ("Ver sitio en vivo") don't have this attribute and open directly. Keep this distinction when adding portfolio entries.
- **Contact form**: submits via AJAX to FormSubmit.co (`formsubmit.co/ajax/<email>`) — no backend of its own. Has a hidden honeypot field (`_honey`) for spam filtering, checked in `script.js` before submit.
- **Canvas particle background**: the hero's wave animation (`#waveCanvas`) is native Canvas 2D, no library, with a lower particle grid density on narrow viewports for perf.
- **Cursor glow**: only activated when `(pointer: fine)` matches and `prefers-reduced-motion` is not set.
- **Scroll reveal**: generic `.reveal` class + `IntersectionObserver` in `script.js` adds `.show` to trigger CSS transitions; used site-wide instead of a library.

## Content/editing conventions

- Spanish-language content throughout (`lang="es"`); keep new copy in Spanish unless told otherwise.
- Real client site links open with `target="_blank" rel="noopener noreferrer"`.
- Accent color and other design tokens live in `:root` in `styles.css` (`--accent`, `--accent-hot`, etc.) — change branding there, not by hunting for hex codes across the file.
