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
cloudflare-worker/gemini-proxy-worker.js  → NOT part of the deployed site (see below)
```

`styles.css` has a numbered index in its header comment (design tokens, reset, background, nav, hero, services, portfolio, "why me", CTA/form, footer, cursor light, reveal animations, WhatsApp button, breakpoints) — check it before searching blindly.

## Architecture notes

- **Mobile-first CSS**: base styles target mobile; `min-width` media queries at 768px (tablet) and 1024px/1280px (desktop) layer on top. Don't write desktop-first overrides.
- **`script.js` structure**: top-level statements (mobile menu, smooth scroll, reveal observer, stat counters, portfolio filters, demo-link warning, contact form submit) run immediately on load; the WhatsApp float, AI assistant widget, canvas particle animation, and cursor glow are each wrapped in their own IIFE further down the file, since they carry private state/config (e.g. the AI widget's `PROXY_URL`).
- **Cache-busting convention**: `index.html` loads CSS/JS with a `?v=N` query param (e.g. `styles.css?v=2`). Whenever you edit `styles.css` or `script.js`, bump that version number in `index.html`, or GitHub Pages/browsers may serve a stale cached copy.
- **Portfolio grid**: each project is a `<div class="portfolio-card" data-cat="...">` block in `index.html` under `#portfolio` (annotated with `<!-- Proyecto N: ... -->` comments). Filtering by category is done client-side in `script.js` by toggling `display` based on `data-filter` matching `data-cat`.
- **Demo vs. live links**: portfolio links to Netlify-hosted mockups carry `data-demo="true"` and get an intercepted `confirm()` warning (no real backend behind them) before opening; links to real client domains ("Ver sitio en vivo") don't have this attribute and open directly. Keep this distinction when adding portfolio entries.
- **Contact form**: submits via AJAX to FormSubmit.co (`formsubmit.co/ajax/<email>`) — no backend of its own. Has a hidden honeypot field (`_honey`) for spam filtering, checked in `script.js` before submit.
- **Canvas particle background**: the hero's wave animation (`#waveCanvas`) is native Canvas 2D, no library, with a lower particle grid density on narrow viewports for perf.
- **Cursor glow**: only activated when `(pointer: fine)` matches and `prefers-reduced-motion` is not set.
- **Scroll reveal**: generic `.reveal` class + `IntersectionObserver` in `script.js` adds `.show` to trigger CSS transitions; used site-wide instead of a library.

## The AI assistant widget (Gemini) and its proxy

The floating chat widget (`#aiAssistant` in `index.html`, wired up in `script.js`) calls an external proxy — it does **not** call Gemini directly, and the API key must never be added to `script.js` or any file that ships to GitHub Pages.

- `cloudflare-worker/gemini-proxy-worker.js` is a separate Cloudflare Worker deployment, not part of the static site build. It holds `SYSTEM_INSTRUCTION` (the assistant's persona/knowledge), `ALLOWED_ORIGINS` (CORS allowlist), and reads the actual API key from the Worker's `GEMINI_API_KEY` environment secret — never hardcode a key there either.
- `script.js` points at the deployed Worker via a `PROXY_URL` constant. If it still contains `'TU-WORKER'` (the placeholder), the widget shows a "not connected yet" message instead of failing silently — this is intentional, not a bug to "fix" by hardcoding a key.
- Client-side session message cap (`MAX_MESSAGES_PER_SESSION`) and truncated conversation history (`MAX_HISTORY_TURNS`) are deliberate quota/cost guards, not arbitrary limits — keep them if editing this section.
- The widget only becomes visible 9 seconds after page load (`setTimeout` adding `.ai-visible` in the widget's IIFE in `script.js`) — don't mistake this delay for a bug when testing.
- Chat messages are inserted via `escapeHTML()` before being written to the DOM (basic anti-XSS for user input and model output) — preserve this when touching message rendering.
- Full deployment steps (Gemini key → Cloudflare Worker → `PROXY_URL`) are documented in `README.md`; consult it before changing this flow.

## Content/editing conventions

- Spanish-language content throughout (`lang="es"`); keep new copy in Spanish unless told otherwise.
- Real client site links open with `target="_blank" rel="noopener noreferrer"`.
- Accent color and other design tokens live in `:root` in `styles.css` (`--accent`, `--accent-hot`, etc.) — change branding there, not by hunting for hex codes across the file.
