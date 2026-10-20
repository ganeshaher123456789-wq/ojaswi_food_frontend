import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || "5000", 10);
const BACKEND_HOST = process.env.BACKEND_HOST || "127.0.0.1";

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=UTF-8",
  ".xml": "application/xml; charset=UTF-8"
};

// Route mappings for clean storefront & admin URLs
const CLEAN_ROUTES = {
  "/": "index.html",
  "/index": "index.html",
  "/login": "login.html",
  "/register": "login.html",
  "/account": "account.html",
  "/orders": "orders.html",
  "/checkout": "checkout.html",
  "/order-confirmation": "order-confirmation.html",
  "/admin": "admin.html",
  "/contact-us": "contact-us.html",
  "/privacy-policy": "privacy-policy.html",
  "/terms-and-conditions": "terms-and-conditions.html",
  "/refund-policy": "refund-policy.html",
  "/shipping-policy": "shipping-policy.html",
  "/cancellation-policy": "cancellation-policy.html"
};

function resolveFilePath(reqUrl) {
  const pathname = decodeURIComponent(reqUrl.split("?")[0]);

  // Check direct clean route
  if (CLEAN_ROUTES[pathname]) {
    return path.join(__dirname, CLEAN_ROUTES[pathname]);
  }

  // Admin subpath wildcard routes to admin dashboard
  if (pathname.startsWith("/admin/") || pathname === "/admin") {
    return path.join(__dirname, "admin.html");
  }

  // Direct file inside frontend
  const normalized = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  const directPath = path.join(__dirname, normalized);

  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  // Check in public/
  const publicPath = path.join(__dirname, "public", normalized);
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    return publicPath;
  }

  // Check if adding .html matches
  const htmlPath = path.join(__dirname, normalized + ".html");
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    return htmlPath;
  }

  return null;
}

// Proxy API requests to backend
function proxyToBackend(req, res) {
  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${BACKEND_HOST}:${BACKEND_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error(`[Frontend Proxy Error] Failed to connect to backend on port ${BACKEND_PORT}:`, err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: "Backend server is unreachable. Ensure the backend is running on port " + BACKEND_PORT,
      details: err.message
    }));
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Proxy /api requests to backend
  if (req.url.startsWith("/api/")) {
    proxyToBackend(req, res);
    return;
  }

  const filePath = resolveFilePath(req.url);

  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>404 Not Found - Ojaswi Foods</title></head>
        <body style="background:#0b0b0b;color:#d9a441;font-family:sans-serif;text-align:center;padding:50px;">
          <h1>404 - Page Not Found</h1>
          <p style="color:#aaa;">The requested resource "${req.url}" was not found.</p>
          <a href="/" style="color:#d9a441;text-decoration:underline;">Return to Storefront</a>
        </body>
      </html>
    `);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log("==================================================");
  console.log(`[OK] OJASWI FRONTEND DEV SERVER RUNNING`);
  console.log(`>> Storefront:   http://localhost:${PORT}`);
  console.log(`>> Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`>> API Proxy:    http://${BACKEND_HOST}:${BACKEND_PORT}/api`);
  console.log("==================================================");
});

export default server;
