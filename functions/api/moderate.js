/* Private moderation endpoint (Cloudflare Pages Function).
   Auth: Authorization: Bearer <MODERATION_SECRET> — the passphrase set on
   the Pages project (see OWNER-RUNBOOK.md). Used by /admin/reviews.html.

   GET  /api/moderate → { pending: [...], approved: [...] }
   POST /api/moderate → { id, action: "approve" | "reject" } */

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function authorized(request, env) {
  const secret = env.MODERATION_SECRET;
  if (!secret) return false;
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token.length !== secret.length) return false;
  // constant-time comparison
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

  const pending = await env.DB.prepare(
    "SELECT id, name, service, rating, message, created_at FROM reviews WHERE status = 'pending' ORDER BY created_at ASC, id ASC"
  ).all();
  const approved = await env.DB.prepare(
    "SELECT id, name, service, rating, message, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC, id DESC LIMIT 20"
  ).all();

  return json({ pending: pending.results, approved: approved.results });
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const id = Number(body.id);
  const action = body.action;
  if (!Number.isInteger(id) || (action !== "approve" && action !== "reject")) {
    return json({ error: "Expected { id, action: 'approve' | 'reject' }." }, 400);
  }

  const status = action === "approve" ? "approved" : "rejected";
  const result = await env.DB.prepare("UPDATE reviews SET status = ?1 WHERE id = ?2")
    .bind(status, id)
    .run();

  if (!result.meta || result.meta.changes === 0) {
    return json({ error: "No review with that id." }, 404);
  }
  return json({ ok: true, id, status });
}
