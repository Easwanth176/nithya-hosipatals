const fs = require("fs");
const jpeg = require("jpeg-js");

const p =
  "C:/Users/easwanth.konduru/.cursor/projects/c-Users-easwanth-konduru-OneDrive-Desktop-Nithya/assets/c__Users_easwanth.konduru_AppData_Roaming_Cursor_User_workspaceStorage_1d286a54e42edfd64c7c8b9afaa54b0b_images_image-10cf7892-3ded-48c5-ac2c-22ed2bff9731.png";
const raw = jpeg.decode(fs.readFileSync(p), { useTArray: true });
const { width: w, height: h, data } = raw;

function px(x, y) {
  const i = (w * y + x) << 2;
  return [data[i], data[i + 1], data[i + 2]];
}

const hits = [];
for (let y = 320; y < 520; y++) {
  for (let x = 120; x < 400; x++) {
    const [r, g, b] = px(x, y);
    const score = r - g + (b - g) * 0.3;
    if (r > 200 && g < 230 && b > 180 && score > 18) {
      hits.push({ x, y, r, g, b, score });
    }
  }
}
hits.sort((a, b) => b.score - a.score);
console.log("top pinks");
for (const h of hits.slice(0, 12)) {
  const hex = "#" + [h.r, h.g, h.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  console.log(hex, h.score.toFixed(1), h.x, h.y);
}

// median of top 20% scores
const top = hits.slice(0, Math.max(30, Math.floor(hits.length * 0.15)));
let r = 0, g = 0, b = 0;
for (const h of top) { r += h.r; g += h.g; b += h.b; }
const n = top.length;
console.log(
  "saturated",
  n,
  "#" + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("")
);

const y0 = 330, y1 = 520, x0 = 140, x1 = 370;
const rows = 48, cols = 58;
let art = "";
for (let row = 0; row < rows; row++) {
  let line = "";
  const y = Math.round(y0 + ((y1 - y0) * row) / (rows - 1));
  for (let col = 0; col < cols; col++) {
    const x = Math.round(x0 + ((x1 - x0) * col) / (cols - 1));
    const [r, g, b] = px(x, y);
    const score = r - g + (b - g) * 0.2;
    if (score > 22 && r > 205 && g < 235) line += "#";
    else if (score > 12 && r > 215) line += "+";
    else line += ".";
  }
  art += line + "\n";
}
console.log(art);

// HOSPITAL text region under NITHYA (y 544-587 was NITHYA)
console.log("--- below word ---");
for (let y = 590; y < 680; y += 3) {
  let line = "";
  let count = 0;
  for (let x = 140; x < 400; x += 3) {
    const [r, g, b] = px(x, y);
    const notWhite = r < 235 || g < 235 || b < 235;
    if (notWhite && b > r) { line += "#"; count++; }
    else if (notWhite) { line += "+"; count++; }
    else line += ".";
  }
  if (count > 2) console.log(String(y).padStart(3), line);
}
