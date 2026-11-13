const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const src =
  "C:/Users/easwanth.konduru/.cursor/projects/c-Users-easwanth-konduru-OneDrive-Desktop-Nithya/assets/c__Users_easwanth.konduru_AppData_Roaming_Cursor_User_workspaceStorage_1d286a54e42edfd64c7c8b9afaa54b0b_images_image-6b4f1e41-7831-4c71-a2db-dc34b1b01893.png";
const raw = jpeg.decode(fs.readFileSync(src), { useTArray: true });
const { width: w, height: h, data } = raw;
console.log("dims", w, h);

let minX = w, minY = h, maxX = 0, maxY = 0;
const pinks = [];
const blues = [];
const grays = [];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (w * y + x) << 2;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    if (max < 28) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (r > 180 && r > g + 40 && b > 80 && b < r) pinks.push([r, g, b]);
    else if (b > 180 && b > r + 40) blues.push([r, g, b]);
    else if (Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r > 60 && r < 190) grays.push([r, g, b]);
  }
}
function avg(arr) {
  if (!arr.length) return null;
  let r = 0, g = 0, b = 0;
  for (const p of arr) { r += p[0]; g += p[1]; b += p[2]; }
  const n = arr.length;
  const R = Math.round(r / n), G = Math.round(g / n), B = Math.round(b / n);
  return { n, hex: "#" + [R, G, B].map((v) => v.toString(16).padStart(2, "0")).join("") };
}
console.log("bounds", minX, minY, maxX, maxY);
console.log("pink", avg(pinks));
console.log("blue", avg(blues));
console.log("gray", avg(grays));

const pad = 24;
const x0 = Math.max(0, minX - pad);
const y0 = Math.max(0, minY - pad);
const x1 = Math.min(w - 1, maxX + pad);
const y1 = Math.min(h - 1, maxY + pad);
const cw = x1 - x0 + 1;
const ch = y1 - y0 + 1;
const png = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = (w * (y0 + y) + (x0 + x)) << 2;
    const di = (cw * y + x) << 2;
    const r = data[si], g = data[si + 1], b = data[si + 2];
    const max = Math.max(r, g, b);
    let a = 255;
    if (max < 18) a = 0;
    else if (max < 55) a = Math.round(((max - 18) / 37) * 255);
    png.data[di] = r;
    png.data[di + 1] = g;
    png.data[di + 2] = b;
    png.data[di + 3] = a;
  }
}
const out = path.resolve("logo/nithya-logo.png");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, PNG.sync.write(png));
console.log("wrote", out, cw, ch);
