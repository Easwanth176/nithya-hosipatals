const fs = require("fs");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

const src =
  "C:/Users/easwanth.konduru/.cursor/projects/c-Users-easwanth-konduru-OneDrive-Desktop-Nithya/assets/c__Users_easwanth.konduru_AppData_Roaming_Cursor_User_workspaceStorage_1d286a54e42edfd64c7c8b9afaa54b0b_images_image-10cf7892-3ded-48c5-ac2c-22ed2bff9731.png";
const raw = jpeg.decode(fs.readFileSync(src), { useTArray: true });
const x0 = 10;
const y0 = 280;
const cw = 450;
const ch = 460;
const png = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((y0 + y) * raw.width + (x0 + x)) << 2;
    const di = (y * cw + x) << 2;
    png.data[di] = raw.data[si];
    png.data[di + 1] = raw.data[si + 1];
    png.data[di + 2] = raw.data[si + 2];
    png.data[di + 3] = 255;
  }
}
fs.writeFileSync(
  "c:/Users/easwanth.konduru/OneDrive/Desktop/Nithya/.logo-build/original-crop.png",
  PNG.sync.write(png)
);
console.log("cropped");
