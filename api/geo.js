// Returns the visitor's approximate (city-level) coordinates from Vercel's IP geolocation headers.
// Used only to decide day vs night styling on the landing page. Nothing is logged or stored.
export const config = { runtime: "edge" };

export default function handler(request) {
  const num = (h) => {
    const v = parseFloat(request.headers.get(h) ?? "");
    return Number.isFinite(v) ? v : null;
  };
  return new Response(JSON.stringify({ lat: num("x-vercel-ip-latitude"), lon: num("x-vercel-ip-longitude") }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
