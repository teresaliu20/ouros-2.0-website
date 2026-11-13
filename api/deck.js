// Investor deck at ourosmaterials.com/deck (rewritten here by vercel.json).
// Visitors enter their email + the shared passcode. On success they get a signed cookie
// (30 days) and the deck, decrypted server-side from api/_deck-data.js.
//
// Vercel env vars:
//   DECK_PASSWORD    the passcode investors type (required)
//   DECK_KEY         base64 AES key that decrypts the deck; also signs cookies (required)
//   DECK_WEBHOOK_URL optional: POSTs {text,email,...} on each login (Slack incoming webhook, Zapier, etc.)
//   ATTIO_API_KEY    optional: on each login, finds or creates the person in Attio and adds a note
//   RESEND_API_KEY   optional: emails DECK_NOTIFY_EMAIL when someone signs in, and when they come back
//                    (at most once per 6 hours per viewer). Skips viewers on DECK_NOTIFY_SKIP_DOMAIN.
//   DECK_NOTIFY_EMAIL     default teresa@ourosmaterials.com
//   DECK_NOTIFY_FROM      default "Ouros Deck <onboarding@resend.dev>" (works without DNS setup when the
//                         Resend account is registered to DECK_NOTIFY_EMAIL)
//   DECK_NOTIFY_SKIP_DOMAIN default ourosmaterials.com (your own team's views don't email you)
import { IV, DATA } from "./_deck-data.js";

export const config = { runtime: "edge" };

const COOKIE = "ouros_deck";
const SEEN = "ouros_deck_seen";
const SEEN_AGE = 60 * 60 * 6;
const MAX_AGE = 60 * 60 * 24 * 30;
const CONTACT = "teresa@ourosmaterials.com";
const enc = new TextEncoder();

export default async function handler(request, context) {
  const { DECK_PASSWORD, DECK_KEY } = process.env;
  if (!DECK_PASSWORD || !DECK_KEY) return new Response("The deck isn't configured yet.", { status: 503 });

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "logout") {
    return new Response(null, { status: 303, headers: { Location: "/deck", "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (request.method === "POST") return login(request, context);

  const session = await readSession(request);
  if (!session) return gate(200);

  // Signed-in check of the email alert setup: /deck?action=test-email
  if (action === "test-email") {
    const text = (m) => new Response(m, { headers: { "content-type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    if (!process.env.RESEND_API_KEY) return text("RESEND_API_KEY is not set for this deployment. Add it in Vercel (Production) and redeploy.");
    const r = await sendEmail(visitOf(session.e, request), "tested email alerts on", true);
    return text(r.ok ? `Test email sent to ${process.env.DECK_NOTIFY_EMAIL || CONTACT}. Check your inbox (and spam).` : `Resend refused the email (HTTP ${r.status}): ${r.body}`);
  }

  try {
    const headers = new Headers(htmlHeaders());
    const seen = (request.headers.get("cookie") || "").split(/;\s*/).some((c) => c.startsWith(SEEN + "="));
    if (!seen) {
      const n = emailNotify(visitOf(session.e, request), "came back to");
      if (context && context.waitUntil) context.waitUntil(n.catch(() => {}));
      else await n.catch(() => {});
      headers.append("Set-Cookie", `${SEEN}=1; Path=/; Max-Age=${SEEN_AGE}; HttpOnly; Secure; SameSite=Lax`);
    }
    return new Response(await deckHtml(), { headers });
  } catch (e) {
    console.error("deck decrypt failed", e);
    return new Response("The deck couldn't be opened. Please email " + CONTACT, { status: 500 });
  }
}

// ---------- login ----------
async function login(request, context) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const pass = String(form.get("password") || "");

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return gate(400, "Please enter a valid email address.", email);
  }
  if (!safeEqual(pass, process.env.DECK_PASSWORD)) {
    console.log(JSON.stringify({ deck: "wrong_passcode", email, at: new Date().toISOString() }));
    await new Promise((r) => setTimeout(r, 700)); // slows down guessing
    return gate(401, "That passcode isn't right.", email);
  }

  const visit = visitOf(email, request);
  console.log(JSON.stringify({ deck: "login", ...visit }));
  const notify = Promise.allSettled([webhook(visit), attio(visit), emailNotify(visit, "signed in to")]);
  if (context && context.waitUntil) context.waitUntil(notify);
  else await notify;

  const token = await sign({ e: email, x: Date.now() + MAX_AGE * 1000 });
  return new Response(null, {
    status: 303,
    headers: [
      ["Location", "/deck"],
      ["Set-Cookie", `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`],
      ["Set-Cookie", `${SEEN}=1; Path=/; Max-Age=${SEEN_AGE}; HttpOnly; Secure; SameSite=Lax`],
    ],
  });
}

function visitOf(email, request) {
  return {
    email,
    at: new Date().toISOString(),
    city: decodeURIComponent(request.headers.get("x-vercel-ip-city") || ""),
    country: request.headers.get("x-vercel-ip-country") || "",
  };
}

// ---------- crypto helpers ----------
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => {
  const t = s.replace(/-/g, "+").replace(/_/g, "/");
  return fromB64(t + "=".repeat((4 - (t.length % 4)) % 4));
};

let cachedHtml;
async function deckHtml() {
  if (cachedHtml) return cachedHtml;
  const key = await crypto.subtle.importKey("raw", fromB64(process.env.DECK_KEY), "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(IV) }, key, fromB64(DATA));
  cachedHtml = new TextDecoder().decode(plain);
  return cachedHtml;
}

// Cookie key mixes in the passcode, so changing DECK_PASSWORD signs everyone out.
const hmacKey = () =>
  crypto.subtle.importKey("raw", enc.encode("cookie|" + process.env.DECK_KEY + "|" + process.env.DECK_PASSWORD), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

async function sign(obj) {
  const payload = b64u(enc.encode(JSON.stringify(obj)));
  return `${payload}.${b64u(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload)))}`;
}

async function readSession(request) {
  const raw = (request.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!payload || !sig) return null;
  try {
    if (!(await crypto.subtle.verify("HMAC", await hmacKey(), unb64u(sig), enc.encode(payload)))) return null;
    const data = JSON.parse(new TextDecoder().decode(unb64u(payload)));
    return data.x > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function safeEqual(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

// ---------- notifications ----------
const where = (v) => [v.city, v.country].filter(Boolean).join(", ");

// Email via Resend (https://resend.com). Plain fetch, no SDK, so it runs on the edge.
async function emailNotify(v, verb) {
  if (!process.env.RESEND_API_KEY) return;
  const skip = (process.env.DECK_NOTIFY_SKIP_DOMAIN ?? "ourosmaterials.com").toLowerCase();
  if (skip && v.email.endsWith("@" + skip)) return;
  const r = await sendEmail(v, verb);
  if (!r.ok) console.error("deck email failed", r.status, r.body);
}

async function sendEmail(v, verb) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.DECK_NOTIFY_EMAIL || CONTACT;
  const from = process.env.DECK_NOTIFY_FROM || "Ouros Deck <onboarding@resend.dev>";
  const loc = where(v);
  const when = new Date(v.at).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: v.email,
      subject: `Deck view: ${v.email} ${verb} the investor deck`,
      text: `${v.email} ${verb} the Ouros investor deck.\n\nWhen: ${when} PT\nWhere: ${loc || "unknown"}\n\nReply to this email to write to them directly.`,
    }),
  });
  return { ok: r.ok, status: r.status, body: r.ok ? "" : await r.text() };
}

async function webhook(v) {
  if (!process.env.DECK_WEBHOOK_URL) return;
  const r = await fetch(process.env.DECK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: `Investor deck opened by ${v.email}${where(v) ? ` (${where(v)})` : ""}`, ...v }),
  });
  if (!r.ok) console.error("deck webhook failed", r.status);
}

// Finds the person by email (or creates them) and adds an "Opened investor deck" note.
// Looks up before creating so existing contacts' email lists are never overwritten.
async function attio(v) {
  const key = process.env.ATTIO_API_KEY;
  if (!key) return;
  const h = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const api = "https://api.attio.com/v2";
  try {
    let id;
    const q = await fetch(`${api}/objects/people/records/query`, { method: "POST", headers: h, body: JSON.stringify({ filter: { email_addresses: v.email }, limit: 1 }) });
    if (q.ok) id = (await q.json())?.data?.[0]?.id?.record_id;
    else console.error("attio query failed", q.status, await q.text());
    if (!id) {
      const c = await fetch(`${api}/objects/people/records`, { method: "POST", headers: h, body: JSON.stringify({ data: { values: { email_addresses: [v.email] } } }) });
      if (!c.ok) return console.error("attio create failed", c.status, await c.text());
      id = (await c.json())?.data?.id?.record_id;
    }
    if (!id) return;
    const n = await fetch(`${api}/notes`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ data: { parent_object: "people", parent_record_id: id, title: "Opened investor deck", format: "plaintext", content: `Logged in to ourosmaterials.com/deck at ${v.at}${where(v) ? ` from ${where(v)}` : ""}.` } }),
    });
    if (!n.ok) console.error("attio note failed", n.status, await n.text());
  } catch (e) {
    console.error("attio error", e);
  }
}

// ---------- pages ----------
function htmlHeaders() {
  return { "content-type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Frame-Options": "DENY" };
}

const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function gate(status, error = "", email = "") {
  return new Response(
    `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ouros Materials · Investor Deck</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
@font-face{font-family:'Inter';src:url('/fonts/inter-var.woff2') format('woff2');font-weight:100 900;font-display:swap}
@font-face{font-family:'GeistMono';src:url('/fonts/geist-mono.woff2') format('woff2');font-weight:100 900;font-display:swap}
@font-face{font-family:'Newsreader';src:url('/fonts/newsreader-var-italic.woff2') format('woff2');font-weight:200 800;font-style:italic;font-display:swap}
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;background:#ECEBE6;color:#121211;font-family:Inter,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column}
header,footer{display:flex;justify-content:space-between;align-items:center;padding:28px 40px;font-family:GeistMono,ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7a7872}
header img{height:22px;width:auto;display:block}
main{flex:1;display:grid;grid-template-columns:1.1fr 1fr;gap:64px;align-items:center;padding:0 40px 40px;max-width:1240px;width:100%;margin:0 auto}
h1{font-weight:500;font-size:clamp(40px,5.4vw,76px);line-height:1.02;letter-spacing:-.04em}
h1 em{font-family:Newsreader,Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.01em}
.lede{margin-top:20px;font-size:18px;color:#7a7872;max-width:440px;line-height:1.4}
form{border-top:1px solid rgba(18,18,17,.16);padding-top:28px;display:flex;flex-direction:column;gap:18px}
label{font-family:GeistMono,ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7a7872;display:flex;flex-direction:column;gap:8px}
input{font:inherit;font-family:Inter,sans-serif;font-size:18px;letter-spacing:0;text-transform:none;color:#121211;background:transparent;border:none;border-bottom:1px solid rgba(18,18,17,.3);padding:10px 0;outline:none;border-radius:0}
input:focus{border-bottom-color:#E0552B}
button{margin-top:8px;font:inherit;font-size:16px;font-weight:500;background:#121211;color:#ECEBE6;border:none;padding:16px 22px;border-radius:999px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
button:hover{background:#E0552B}
.err{color:#E0552B;font-size:14px}
.fine{font-size:12px;color:#7a7872;line-height:1.5}
.fine a{color:inherit}
@media (max-width:820px){main{grid-template-columns:1fr;gap:40px;padding:24px 24px 32px}header,footer{padding:22px 24px}}
</style></head>
<body>
<header><a href="/"><img src="/brand/ouros-logo-primary-black.svg" alt="Ouros Materials"></a><span>Confidential</span></header>
<main>
  <div>
    <h1>Rebuilding America's materials <em>frontier.</em></h1>
    <p class="lede">Our investor deck is private. Enter your email and the passcode we sent you.</p>
  </div>
  <form method="POST" action="/deck" autocomplete="on">
    ${error ? `<p class="err" role="alert">${esc(error)}</p>` : ""}
    <label>Work email<input type="email" name="email" required autocomplete="email" value="${esc(email)}" ${email ? "" : "autofocus"}></label>
    <label>Passcode<input type="password" name="password" required autocomplete="current-password" ${email ? "autofocus" : ""}></label>
    <button type="submit"><span>View deck</span><span>→</span></button>
    <p class="fine">Your email is shared with Ouros Materials so we know who has the deck. Need a passcode? <a href="mailto:${CONTACT}">${CONTACT}</a></p>
  </form>
</main>
<footer><span>Ouros Materials</span><span>Advanced ceramics, reinvented</span></footer>
</body></html>`,
    { status, headers: htmlHeaders() }
  );
}
