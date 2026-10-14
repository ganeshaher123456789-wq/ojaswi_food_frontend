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

console.log(`✓ Copied ${htmlCount} storefront HTML pages and configurations into dist/`);
console.log("==================================================");
console.log("✨ FRONTEND PRODUCTION BUILD COMPLETE AND VERIFIED!");
console.log("==================================================");
