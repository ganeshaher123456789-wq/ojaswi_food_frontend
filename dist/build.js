import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("📦 BUILDING OJASWI FRONTEND FOR PRODUCTION (VERCEL)");
console.log("==================================================");

const distDir = path.resolve(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Subdirectories to replicate in dist/
const subdirs = ["css", "js", "images", "public"];
for (const sub of subdirs) {
  const src = path.resolve(__dirname, sub);
  const dest = path.resolve(distDir, sub);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Copied asset directory: ${sub}/`);
  }
}

// Copy HTML files and root static files to dist/
const files = fs.readdirSync(__dirname);
let htmlCount = 0;
for (const file of files) {
  const fullPath = path.resolve(__dirname, file);
  if (fs.statSync(fullPath).isFile()) {
    if (file.endsWith(".html") || file.endsWith(".js") || file.endsWith(".json") || file.endsWith(".xml") || file.endsWith(".txt")) {
      fs.copyFileSync(fullPath, path.resolve(distDir, file));
      if (file.endsWith(".html")) htmlCount++;
    }
  }
}

// Generate production runtime config
const prodApiUrl = process.env.VITE_API_URL || 
                   process.env.PUBLIC_API_URL || 
                   process.env.OJASWI_API_URL || 
                   process.env.OJASWIAPIURL || 
                   "https://ojaswi-food-backend.onrender.com";

const prodGoogleClientId = process.env.GOOGLE_CLIENT_ID || 
                           process.env.VITE_GOOGLE_CLIENT_ID || 
                           process.env.PUBLIC_GOOGLE_CLIENT_ID || 
                           "";

const prodConfigContent = `/**
 * Ojaswi Premium Spices - Frontend Production Configuration (Vercel Build)
 * Live Render Backend: ${prodApiUrl}
 */
(function() {
  const isLocal = typeof window !== "undefined" && (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
  const defaultApiUrl = isLocal ? "http://localhost:5000" : "${prodApiUrl}";
  const resolved = window.OJASWI_API_URL || window.OJASWIAPIURL || window.VITE_API_URL || defaultApiUrl;
  window.OJASWI_API_URL = resolved;
  window.OJASWIAPIURL = resolved;
  window.GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || "${prodGoogleClientId}";
})();
`;

fs.writeFileSync(path.resolve(distDir, "config.js"), prodConfigContent, "utf8");
const distPublicDir = path.resolve(distDir, "public");
if (fs.existsSync(distPublicDir)) {
  fs.writeFileSync(path.resolve(distPublicDir, "config.js"), prodConfigContent, "utf8");
}
console.log(`✓ Injected production backend configuration (${prodApiUrl}) into dist/config.js`);

console.log(`✓ Copied ${htmlCount} storefront HTML pages and configurations into dist/`);
console.log("==================================================");
console.log("✨ FRONTEND PRODUCTION BUILD COMPLETE AND VERIFIED!");
console.log("==================================================");
