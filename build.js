const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "dist");
const files = ["index.html", "privacy.html", "styles.css", "i18n.js", "main.js", "site.webmanifest"];
const logoFiles = [
  "nithya-logo-180.webp",
  "nithya-logo-240.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "share.jpg"
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "logo"), { recursive: true });

for (const file of files) fs.copyFileSync(path.join(root, file), path.join(out, file));
for (const file of logoFiles) fs.copyFileSync(path.join(root, "logo", file), path.join(out, "logo", file));

const total = [...files, ...logoFiles.map((f) => `logo/${f}`)]
  .reduce((sum, file) => sum + fs.statSync(path.join(out, file)).size, 0);
console.log(`dist ready: ${files.length + logoFiles.length} files, ${(total / 1024).toFixed(0)} KB`);
