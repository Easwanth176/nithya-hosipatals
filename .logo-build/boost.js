const fs = require("fs");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const src =
  "C:/Users/easwanth.konduru/.cursor/projects/c-Users-easwanth-konduru-OneDrive-Desktop-Nithya/assets/c__Users_easwanth.konduru_AppData_Roaming_Cursor_User_workspaceStorage_1d286a54e42edfd64c7c8b9afaa54b0b_images_image-10cf7892-3ded-48c5-ac2c-22ed2bff9731.png";
const raw = jpeg.decode(fs.readFileSync(src), { useTArray: true });

const x0 = 150;
const y0 = 340;
const cw = 220;
const ch = 200;
const scale = 3;
const png = new PNG({ width: cw * scale, height: ch * scale });

for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((y0 + y) * raw.width + (x0 + x)) << 2;
    const r = raw.data[si];
    const g = raw.data[si + 1];
    const b = raw.data[si + 2];
    // Pull pale pink away from white.
    const pink = Math.max(0, r - g) + Math.max(0, b - g) * 0.35;
    const v = Math.max(0, Math.min(255, 255 - pink * 7));
    const rr = v;
    const gg = Math.max(0, v - pink * 2);
    const bb = v;
    for (let sy = 0; sy < scale; sy++) {
      for (let sx = 0; sx < scale; sx++) {
        const di = ((y * scale + sy) * cw * scale + (x * scale + sx)) << 2;
        png.data[di] = rr;
        png.data[di + 1] = gg;
        png.data[di + 2] = bb;
        png.data[di + 3] = 255;
      }
    }
  }
}

fs.writeFileSync(
  "c:/Users/easwanth.konduru/OneDrive/Desktop/Nithya/.logo-build/icon-boost.png",
  PNG.sync.write(png)
);
console.log("boosted", cw * scale, ch * scale);
