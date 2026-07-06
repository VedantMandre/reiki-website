/* Public reviews endpoint (Cloudflare Pages Function).
   GET  /api/reviews → { reviews: [...] } — approved reviews, newest first.
   POST /api/reviews → stores a submission as "pending"; nothing becomes
   visible until the owner approves it via /admin/reviews.html. */

const SERVICES = [
  "Reiki Healing",
  "Numerology Reading",
  "Crystal Remedies & Healing",
  "Spiritual Consultation",
  "Reiki Courses & Attunements",
  "Other",
];

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export async function onRequestGet({ env }) {
  // D1 binding not configured yet (OWNER-RUNBOOK.md step 10) — behave
  // like "no reviews" instead of erroring
  if (!env.DB) return json({ reviews: [] }, 200, { "Cache-Control": "no-store" });
  const { results } = await env.DB.prepare(
    "SELECT id, name, service, rating, message, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC, id DESC LIMIT 50"
  ).all();
  // no-store so a freshly approved review shows on the very next page load
  return json({ reviews: results }, 200, { "Cache-Control": "no-store" });
}

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(ip + "|" + salt);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return json({ error: "Reviews are not set up yet — please WhatsApp us your review instead." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  // Honeypot: bots fill every field. Pretend success, store nothing.
  if (typeof body._honey === "string" && body._honey.trim() !== "") {
    return json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const service = typeof body.service === "string" ? body.service.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const rating = Number(body.rating);

  if (!name || name.length > 80) {
    return json({ error: "Please give your name (up to 80 characters)." }, 400);
  }
  if (!SERVICES.includes(service)) {
    return json({ error: "Please pick the service you experienced." }, 400);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: "Please choose a star rating from 1 to 5." }, 400);
  }
  if (message.length < 10 || message.length > 1000) {
    return json({ error: "Please write a review between 10 and 1000 characters." }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hashIp(ip, env.MODERATION_SECRET || "");

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM reviews WHERE ip_hash = ?1 AND created_at > datetime('now', '-1 hour')"
  )
    .bind(ipHash)
    .first();
  if (recent && recent.n >= 4) {
    return json({ error: "Too many reviews from this connection — please try again later." }, 429);
  }

  await env.DB.prepare(
    "INSERT INTO reviews (name, service, rating, message, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5)"
  )
    .bind(name, service, rating, message, ipHash)
    .run();

  return json({ ok: true });
}
