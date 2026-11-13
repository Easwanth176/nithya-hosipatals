const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "logo", "nithya-logo.png");
const out = (name) => path.join(root, "logo", name);
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const clear = { r: 255, g: 255, b: 255, alpha: 0 };

// Heart mark only, from the full logo.
const mark = { left: 212, top: 15, width: 326, height: 382 };

async function squareMark(size, pad, background) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(src).extract(mark)
    .resize(inner, inner, { fit: "contain", background: clear })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .png();
}

(async () => {
  await sharp(src).resize({ width: 240 }).webp({ quality: 88 }).toFile(out("nithya-logo.webp"));
  await sharp(src).resize({ width: 240 }).png({ compressionLevel: 9, palette: true }).toFile(out("nithya-logo-240.png"));
  await (await squareMark(32, 0.06, clear)).toFile(out("favicon-32.png"));
  await (await squareMark(180, 0.14, white)).toFile(out("apple-touch-icon.png"));
  await (await squareMark(512, 0.14, white)).toFile(out("icon-512.png"));
  await (await squareMark(192, 0.14, white)).toFile(out("icon-192.png"));

  const logoForShare = await sharp(src).resize({ height: 420 }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: white } })
    .composite([{ input: logoForShare, gravity: "center" }])
    .jpeg({ quality: 86 })
    .toFile(out("share.jpg"));

  console.log("assets written");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
