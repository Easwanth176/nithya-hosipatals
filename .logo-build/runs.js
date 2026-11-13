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
  return r - g + Math.max(0, b - g) * 0.25;
}

const x0 = 160;
const y0 = 350;
const x1 = 370;
const y1 = 530;

for (let y = y0; y <= y1; y += 4) {
  const runs = [];
  let on = false;
  let start = 0;
  let best = 0;
  let bestX = 0;
  for (let x = x0; x <= x1; x++) {
    const p = pinkAt(x, y);
    if (p > 14) {
      if (!on) {
        on = true;
        start = x;
        best = p;
        bestX = x;
      } else if (p > best) {
        best = p;
        bestX = x;
      }
    } else if (on) {
      runs.push(`${start}-${x - 1}@${bestX}`);
      on = false;
    }
  }
  if (on) runs.push(`${start}-${x1}@${bestX}`);
  if (runs.length) console.log(String(y).padStart(3), runs.join("  "));
}
