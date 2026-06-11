# Owner Runbook — Sujata Mandre Website

This is a separate, post-implementation operations runbook. It is **not**
part of the implementation plan (see `Implementation.md`, where every item
is complete). Everything here requires Vedant or Sujata personally —
logging into an account, clicking a link in an inbox, or supplying a
physical photo/scan — and is independent of the codebase, which is finished
and pushed to `main`.

1. **Enable GitHub Pages (one click, one time):** Repo → Settings → Pages →
   under "Build and deployment", set Source to **"GitHub Actions"**. The
   `deploy.yml` workflow (already added) will then publish the site to
   `https://vedantmandre.github.io/reiki-website/` automatically on every
   push to `main`, including the push that already happened.
2. **FormSubmit activation:** once the site is live, submit the contact form
   once and click the activation link FormSubmit emails to
   sujata.mandre@gmail.com (check spam).
3. **Google Search Console:** verify the property for the live URL and
   submit `https://vedantmandre.github.io/reiki-website/sitemap.xml`.
4. **GA4 property:** create a property at analytics.google.com, then replace
   the placeholder `G-XXXXXXXXXX` with the real Measurement ID in two places:
   `index.html` (the `gtag/js?id=...` script tag) and `js/main.js` (the
   `gtag("config", "...")` call).
5. **B3 — real portrait photo:** supply a photo (WebP, <300KB); a follow-up
   code change will then drop it into `.portrait-frame__inner`.
6. **Real certificate scans** for the certifications strip, to replace the
   current placeholder badges.
7. **Post-deploy checks** (need the live URL from item 1): Rich Results Test
   for the JSON-LD, and a Lighthouse audit (Performance/SEO/Accessibility/
   Best Practices) — the implementation already targets >95 on all four.
