// Cloudflare Worker: serves the static site from ./public and adds security headers.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const url = new URL(request.url);
    if (url.pathname === "/index.html") {
      url.pathname = "/";
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set("Content-Security-Policy", CSP);
    out.headers.set("X-Content-Type-Options", "nosniff");
    out.headers.set("X-Frame-Options", "DENY");
    out.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    out.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    const p = url.pathname;
    out.headers.set(
      "Cache-Control",
      p === "/" || p.endsWith(".html") || p.endsWith(".xml") || p.endsWith(".txt")
        ? "public, max-age=300"
        : "public, max-age=86400"
    );
    return out;
  },
};
