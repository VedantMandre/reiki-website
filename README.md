# Sujata Mandre — Official Website

A modern, premium, fully responsive single-page website for **Sujata Mandre**,
certified Reiki Grandmaster, Numerologist, and Spiritual Consultant.

## Stack

Pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step.

```
sujata-mandre-website/
├── index.html      # Single-page site (hero, about, services, journey, testimonials, contact)
├── css/style.css   # Design system, layout, animations, responsive breakpoints
└── js/main.js      # Nav, scroll-reveal, active-section highlighting, contact form
```

## Run locally

Any static file server works:

```bash
cd sujata-mandre-website
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Drop the folder onto any static host — GitHub Pages, Netlify, Vercel, or an
ordinary web server. No server-side code is required.

## Customizing

- **Contact details** — search `hello@sujatamandre.com` and `+91 00000 00000`
  in `index.html` and `js/main.js` and replace with real contact info.
- **Portrait photo** — replace the SVG placeholder inside
  `.portrait-frame__inner` in `index.html` with an `<img>` tag.
- **Form backend** — the contact form currently opens the visitor's email
  client. To capture submissions instead, point the form at a service such as
  Formspree or Netlify Forms and remove the `mailto:` fallback in `js/main.js`.
- **Colors & fonts** — all design tokens live in the `:root` block at the top
  of `css/style.css`.
