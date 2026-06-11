# Implementation Plan — Sujata Mandre Official Website

Premium, mobile-first, zero-cost static website for **Sujata Mandre** — Reiki Grandmaster, Numerologist & Spiritual Consultant.

## Current State (already done)

- Single-page site in pure HTML/CSS/vanilla JS — no frameworks, no build step
  - `index.html` — hero, about, services (3 cards), journey, quote band, testimonials, contact
  - `css/style.css` — design tokens in `:root`, premium warm-ivory light theme, responsive
  - `js/main.js` — nav toggle, scroll-reveal, active-section highlighting, contact form handler
- Real contact details in place: `sujata.mandre@gmail.com`, `+91 99305 84976`
- Git repo, branch `feature/light-theme-and-contact-updates`

## Contact / Constants

| Item | Value |
|---|---|
| Email | sujata.mandre@gmail.com |
| Phone / WhatsApp | +91 99305 84976 (`wa.me/919930584976`) |
| Hours | Mon–Sat, 10:00 AM – 7:00 PM IST |
| GitHub user | VedantMandre |
| Hosting target | GitHub Pages (free), later Cloudflare Pages + `sujatamandre.com` |

---

## Status (2026-06-10)

Phases A, B1, B2, C, and E are implemented and pushed to
`feature/light-theme-and-contact-updates`. Remaining items require either a
real photo/certificate asset or manual access to GitHub/FormSubmit/GA4/Search
Console accounts — see notes inline below.

---

## Phase A — Lead Generation (do first)

### A1. Wire contact form to FormSubmit — ✅ done
- In `index.html`, change the `<form id="contactForm">` to:
  - `action="https://formsubmit.co/sujata.mandre@gmail.com" method="POST"`
- Add hidden inputs:
  - `<input type="hidden" name="_subject" value="New inquiry from sujatamandre website">`
  - `<input type="text" name="_honey" style="display:none">` (honeypot anti-spam)
  - `<input type="hidden" name="_captcha" value="false">`
  - `<input type="hidden" name="_template" value="table">`
- Update `js/main.js`: submit via `fetch` to FormSubmit's AJAX endpoint (`https://formsubmit.co/ajax/sujata.mandre@gmail.com`) so the user stays on the page; show success/error in `#formNote`. Remove any `mailto:` fallback.
- Keep client-side validation (required fields, email format).
- **Note:** FormSubmit sends a one-time activation email on first submission — Sujata (or Vedant) must click the activation link before submissions flow. **Action needed:** submit the form once on the live site and check sujata.mandre@gmail.com (incl. spam) for the activation link.

### A2. Floating WhatsApp button — ✅ done
- Fixed bottom-right button linking to `https://wa.me/919930584976?text=Hello%20Sujata%2C%20I%27d%20like%20to%20book%20a%20consultation.`
- `target="_blank" rel="noopener"`, `aria-label="Chat on WhatsApp"`
- WhatsApp green (#25D366) circular button with inline SVG icon; subtle pulse animation; doesn't overlap content on mobile; visible after slight scroll (optional).

---

## Phase B — Content Additions

### B1. Reiki Courses service card — ✅ done
- Add a 4th card to `.services__grid`: **Reiki Courses & Attunements**
  - Reiki Level 1, Reiki Level 2, Reiki Master, Reiki Grandmaster Training
  - CTA: "Enroll / Inquire →" linking to `#contact`
- Adjust services grid to 2×2 on desktop, 1 column on mobile. Add "Reiki Courses" option to the contact form's service `<select>`.

### B2. Certifications strip — ✅ done (placeholder badges)
- Small section (under About or before Testimonials): certificate names/badges — Usui Reiki Grandmaster, training certificates, memberships.
- Use placeholder badge styling until real certificate scans are provided.

### B3. Real portrait photo — ⏳ blocked on asset (when asset available)
- Replace SVG placeholder inside `.portrait-frame__inner` with `<img>`.
- WebP, under 300 KB, with `width`/`height` attributes. Above-the-fold images: `fetchpriority="high"`, NOT `loading="lazy"`. Below-fold images: `loading="lazy"`.

---

## Phase C — SEO

### C1. robots.txt — ✅ done
```
User-agent: *
Allow: /
Sitemap: https://<site-url>/sitemap.xml
```
- Uses `https://vedantmandre.github.io/reiki-website/sitemap.xml`. **Action needed:** if a custom domain (`sujatamandre.com`) is set up later, update this URL.

### C2. sitemap.xml — ✅ done
- Single URL (homepage) initially; update `<loc>` when custom domain lands.

### C3. Meta tag upgrades in `<head>` — ✅ done
- `<link rel="canonical">`
- `og:url`, `og:image` (1200×630 social share image), `og:site_name`
- Twitter card tags (`summary_large_image`)
- Keyword-rich meta description: Reiki Healing India, Online Reiki Consultation, Numerology Services Worldwide, Chakra Healing, Reiki Grandmaster
- `og:image`/`twitter:image` point to a generated placeholder graphic at `assets/og-image.png` — swap for a designed 1200×630 image when available.

### C4. JSON-LD structured data (biggest SEO win) — ✅ done
- `Person` schema for Sujata Mandre + `ProfessionalService` schema: services offered, telephone, email, opening hours, area served (worldwide / India).

### C5. Real favicon — ✅ done
- Replaced data-URI emoji favicon with `favicon.svg`, `favicon.ico`, `favicon-16x16.png`/`favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`/`512x512.png`, and `site.webmanifest`. Icons are a generated gold/violet mandala mark matching the theme — swap for a designed brand mark if Sujata wants something more bespoke.

---

## Phase D — Deployment (free)

1. ⏳ Feature branch is committed & pushed (`feature/light-theme-and-contact-updates`). **Action needed:** open a PR and merge to `main` (or merge directly), then push `main` to GitHub.
2. ⏳ **Action needed (GitHub UI):** Settings → Pages → Deploy from branch → `main` / root. Site will be live at `https://vedantmandre.github.io/reiki-website/`.
3. ✅ Canonical URL, `og:url`, sitemap `<loc>`, and robots.txt sitemap line already use `https://vedantmandre.github.io/reiki-website/`.
4. ⏳ **Action needed (Google account):** Search Console — verify property, submit sitemap.
5. ⏳ **Action needed (Google account):** GA4 — create property, add gtag.js snippet (CSP already allows `googletagmanager.com`/`google-analytics.com`); track form submission success and WhatsApp button click events.
6. Future upgrade (not now): buy `sujatamandre.com` (~$10–15/yr), move to Cloudflare Pages or point custom domain at GitHub Pages.

---

## Phase E — Performance & Hardening

- Run Lighthouse; target >95 on all categories (site is ~40 KB, realistic).
- Fonts already load with `display=swap`; self-host Google Fonts only if Lighthouse flags them.
- Add basic CSP `<meta http-equiv="Content-Security-Policy">` allowing self, Google Fonts, FormSubmit, GA.
- Optional: minify CSS/JS (low priority at current size).
- Accessibility pass: contrast, focus states, alt text, heading order.

---

## Phase F — Future (do NOT build now)

- Calendly booking embed (free tier) for session scheduling
- Blog (Reiki tips, numerology insights, spiritual growth) for SEO
- Dedicated course pages per Reiki level, each SEO-optimized
- Testimonial carousel with client photos; success stories section

---

## Recommended Work Order

**A1 → A2 → B1 → C1–C5 → D**, then B2/B3 when assets (photo, certificates) arrive, E before announcing the site, F later.

## Verification Checklist

- [ ] Form submission arrives at sujata.mandre@gmail.com (after FormSubmit activation — **needs live URL + activation click**)
- [x] WhatsApp button opens chat with pre-filled message (verified locally, link format correct)
- [x] All 4 service cards render correctly (2x2 grid verified at desktop width; responsive rules in place for 360px/768px)
- [ ] `robots.txt` and `sitemap.xml` reachable on live site (files in place; **needs GitHub Pages live**)
- [ ] Rich Results Test passes for JSON-LD (**needs live URL** — schema added, can't run Google's tool against localhost)
- [ ] Lighthouse: Performance, SEO, Accessibility, Best Practices all >95 (**run after GitHub Pages is live**; CSP, contrast, focus states, skip link, real favicons, meta tags, JSON-LD all in place to support this)
- [ ] GA4 receiving events; Search Console sitemap accepted (**needs Phase D account setup**)
