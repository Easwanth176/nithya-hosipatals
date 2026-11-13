const fs = require("fs");
const jpeg = require("jpeg-js");

const src =
  "C:/Users/easwanth.konduru/.cursor/projects/c-Users-easwanth-konduru-OneDrive-Desktop-Nithya/assets/c__Users_easwanth.konduru_AppData_Roaming_Cursor_User_workspaceStorage_1d286a54e42edfd64c7c8b9afaa54b0b_images_image-10cf7892-3ded-48c5-ac2c-22ed2bff9731.png";
const raw = jpeg.decode(fs.readFileSync(src), { useTArray: true });

function pinkAt(x, y) {
  const i = (raw.width * y + x) << 2;
  const r = raw.data[i];
  const g = raw.data[i + 1];
  const b = raw.data[i + 2];
  return Math.max(0, r - g) + Math.max(0, b - g) * 0.35;
}

const x0 = 155;
const y0 = 345;
const x1 = 360;
const y1 = 530;
const cols = 62;
const rows = 48;
let art = "";
for (let row = 0; row < rows; row++) {
  let line = "";
  const y = Math.round(y0 + ((y1 - y0) * row) / (rows - 1));
  for (let col = 0; col < cols; col++) {
    const x = Math.round(x0 + ((x1 - x0) * col) / (cols - 1));
    const p = pinkAt(x, y);
    if (p > 16) line += "#";
    else if (p > 9) line += "+";
    else line += ".";
  }
  art += line + "\n";
}
console.log(art);
