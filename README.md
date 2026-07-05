# Suved Healers — Official Website

**Healing from Within · Balance · Energy · Peace**

An immersive, fully responsive single-page website for **Suved Healers** by
Sujata Mandre — certified Reiki Grandmaster, Numerologist, and Spiritual
Consultant.

## Stack

HTML, CSS, and vanilla JavaScript — no build step. The experience layer is
loaded from CDN:

- **GSAP 3** (+ ScrollTrigger, SplitText) — preloader, split-text reveals,
  scroll-driven animations, counters, parallax, magnetic buttons, 3D tilt
- **Lenis** — smooth scrolling synced with ScrollTrigger
- **Three.js** — the floating "energy field" particles in the hero

```
reiki-website/
├── index.html        # Single-page site (hero, about, services, journey, testimonials, contact)
├── css/style.css     # Suved Healers design system, layout, responsive breakpoints
├── js/main.js        # All interactivity & animation (degrades gracefully without CDNs/JS)
└── assets/           # Brand logo, OG image
```

Everything degrades gracefully: content is fully visible and the site fully
functional if the CDN libraries fail to load, and all motion is disabled under
`prefers-reduced-motion`.

## Run locally

Any static file server works:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Deployed to GitHub Pages via the workflow in `.github/workflows/`. Any static
host works — no server-side code is required.

## Customizing

- **Colors & fonts** — all design tokens live in the `:root` block at the top
  of `css/style.css` (palette drawn from the Suved Healers brand mark).
- **GA4** — replace the `G-XXXXXXXXXX` placeholder in `index.html` (loader tag)
  and `js/main.js` (config call) with the real Measurement ID.
- **Form backend** — the contact form posts to FormSubmit
  (`sujata.mandre@gmail.com`); see `js/main.js`.
- **Owner tasks** — see `OWNER-RUNBOOK.md`.
