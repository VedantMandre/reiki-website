# Owner Runbook — Suved Healers Website

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

## Suved Healers rebrand follow-ups (July 2026)

The site was renamed from "Suved Healing" to **Suved Healers** and now uses
the occult-styled zodiac/OM badge at `assets/suved-badge.png` (a framed gold
emblem on a dark navy ground) in the nav, about section, and footer, in
place of the old meditating-figure-on-lotus artwork. The badge image itself
is untouched; it's mounted in a gold-ringed frame with an ambient halo glow,
a slow light-sweep sheen, and (in the about section) drifting gold dust —
all via CSS animations plus `initBadgeDust()` in `js/main.js`. Two asset
sets still carry the old branding and need image tooling to regenerate:

8. **PNG favicons** (`favicon.ico`, `favicon-16/32x32.png`,
   `apple-touch-icon.png`, `android-chrome-192/512.png`): regenerate from
   `favicon.svg` or the new badge at https://realfavicongenerator.net and
   replace the files in the repo root.
9. **Social share image** (`assets/og-image.png`): create a 1200×630 image
   from the new badge/palette. The page currently points OG/Twitter tags at
   `assets/suved-badge.png` directly (near-square), which works but a proper
   1200×630 banner renders better; update the `og:image`/`twitter:image`
   tags in `index.html` when ready.

## Customer reviews — one-time setup (July 2026)

The site now has a "Share Your Experience" form in the Testimonials
section. Submissions are stored **privately** in a free Cloudflare D1
database and appear on the website only after you approve them at
`https://suved-healing.pages.dev/admin/reviews.html` (each submission also
emails you via FormSubmit with that link). Approval is instant — no code
change or redeploy involved. Before the first review can be accepted, do
this once (~5 minutes, needs the Cloudflare account):

10. **Create the database:** in a terminal with Node installed, run
    `npx wrangler d1 create suved-reviews` (it will open a browser to log in
    to Cloudflare). Copy the `database_id` it prints into `wrangler.toml`
    (replacing `TODO-set-after-owner-creates-db`), commit, and push.
11. **Create the reviews table:** run
    `npx wrangler d1 execute suved-reviews --remote --file=db/schema.sql`.
12. **Set the moderation passphrase:** Cloudflare dashboard → Workers &
    Pages → `suved-healing` → Settings → Variables and Secrets → add a
    secret named `MODERATION_SECRET` with a passphrase of your choice
    (this is what you type on the approval page — pick something long).
13. **Check the deploy token:** the GitHub secret `CLOUDFLARE_API_TOKEN`
    was created for Pages-only deploys. If the next deploy fails with a
    D1 permission error, edit the token at dash.cloudflare.com → My
    Profile → API Tokens and add the **D1: Edit** permission.
14. **Try it end to end:** submit a test review on the live site, open the
    admin link from the notification email, enter the passphrase, click
    Approve, and confirm the review appears in the Testimonials section.
