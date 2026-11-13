const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "logo");
fs.mkdirSync(outDir, { recursive: true });

const PINK = "#F0B0DE";
const BLUE = "#1A82E8";
const SUB = "#8FA6BE";

const semi = opentype.parse(fs.readFileSync(path.join(__dirname, "Montserrat-SemiBold.ttf")));
const medium = opentype.parse(fs.readFileSync(path.join(__dirname, "Montserrat-Medium.ttf")));

function heartPoints(samples = 160) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    pts.push([x, y]);
  }
  return pts;
}

function toPath(pts) {
  return (
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
      .join(" ") + " Z"
  );
}

function boundsOf(pts, pad = 0) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

function renderText(font, text, fontSize, tracking) {
  const glyphPath = new opentype.Path();
  let x = 0;
  for (const ch of [...text]) {
    const glyph = font.charToGlyph(ch);
    const gPath = glyph.getPath(x, 0, fontSize);
    glyphPath.commands.push(...gPath.commands);
    x += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking;
  }
  const width = text.length ? x - tracking : 0;
  const asc = (font.ascender / font.unitsPerEm) * fontSize;
  const desc = (font.descender / font.unitsPerEm) * fontSize;
  return { d: glyphPath.toPathData(2), width, asc, desc };
}

function renderFitted(font, text, fontSize, targetWidth) {
  const natural = renderText(font, text, fontSize, 0);
  const gaps = [...text].length - 1;
  const tracking = gaps > 0 ? (targetWidth - natural.width) / gaps : 0;
  return renderText(font, text, fontSize, tracking);
}

function buildIcon(stroke) {
  const scaleX = 8.15;
  const scaleY = 7.15;
  const raw = heartPoints();
  const heart = raw.map(([x, y]) => [x * scaleX, y * scaleY]);
  const hb = boundsOf(heart);
  const heartW = hb.maxX - hb.minX;
  const midX = (hb.minX + hb.maxX) / 2;

  let lobeTop = Infinity;
  for (const p of heart) if (p[1] < lobeTop) lobeTop = p[1];

  const childR = heartW * 0.105;
  const motherR = heartW * 0.132;
  const gap = heartW * 0.028;
  const child = {
    cx: midX - heartW * 0.155,
    cy: lobeTop - gap - childR,
    r: childR,
  };
  const mother = {
    cx: midX + heartW * 0.175,
    cy: lobeTop - gap - motherR + heartW * 0.012,
    r: motherR,
  };

  const circles = [
    [child.cx - child.r, child.cy - child.r],
    [child.cx + child.r, child.cy + child.r],
    [mother.cx - mother.r, mother.cy - mother.r],
    [mother.cx + mother.r, mother.cy + mother.r],
  ];
  const b = boundsOf([...heart, ...circles], stroke / 2 + 2);

  const shift = (x, y) => [x - b.minX, y - b.minY];
  const heartShifted = heart.map(([x, y]) => shift(x, y));
  const c1 = shift(child.cx, child.cy);
  const c2 = shift(mother.cx, mother.cy);
  const width = b.maxX - b.minX;
  const height = b.maxY - b.minY;

  const body = `
    <g fill="none" stroke="${PINK}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="${c1[0].toFixed(2)}" cy="${c1[1].toFixed(2)}" r="${childR}"/>
      <circle cx="${c2[0].toFixed(2)}" cy="${c2[1].toFixed(2)}" r="${motherR}"/>
      <path d="${toPath(heartShifted)}"/>
    </g>`;

  return { body, width, height };
}

function svgWrap({ w, h, body, title }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">Nithya Hospital logo. A pink heart with two circles above the wordmark.</desc>
  ${body}
</svg>
`;
}

const icon = buildIcon(11);

const nameSize = 118;
const name = renderText(semi, "NITHYA", nameSize, nameSize * 0.045);
const hospitalSize = 34;
const hospital = renderFitted(medium, "HOSPITAL", hospitalSize, name.width);

const stackGapIcon = 28;
const stackGapWord = 16;
const pad = 8;
const stackW = Math.max(icon.width, name.width) + pad * 2;
const nameX = (stackW - name.width) / 2;
const iconX = (stackW - icon.width) / 2;
const iconY = pad;
const nameY = iconY + icon.height + stackGapIcon + name.asc;
const hospitalY = nameY + stackGapWord + hospital.asc;
const stackH = hospitalY + pad;

const stacked = svgWrap({
  w: stackW,
  h: stackH,
  title: "Nithya Hospital",
  body: `
  <g transform="translate(${iconX.toFixed(2)} ${iconY.toFixed(2)})">${icon.body}</g>
  <path fill="${BLUE}" d="${name.d}" transform="translate(${nameX.toFixed(2)} ${nameY.toFixed(2)})"/>
  <path fill="${SUB}" d="${hospital.d}" transform="translate(${nameX.toFixed(2)} ${hospitalY.toFixed(2)})"/>
`,
});

const hGap = 28;
const hPad = 6;
const textBlockH = name.asc + stackGapWord + hospital.asc;
const hIconScale = textBlockH / icon.height;
const hIconW = icon.width * hIconScale;
const hIconH = icon.height * hIconScale;
const hW = hPad + hIconW + hGap + name.width + hPad;
const hH = textBlockH + hPad * 2;
const hNameX = hPad + hIconW + hGap;
const hNameY = hPad + name.asc;
const hHospY = hNameY + stackGapWord + hospital.asc;
const horizontal = svgWrap({
  w: hW,
  h: hH,
  title: "Nithya Hospital",
  body: `
  <g transform="translate(${hPad.toFixed(2)} ${hPad.toFixed(2)}) scale(${hIconScale.toFixed(4)})">${icon.body}</g>
  <path fill="${BLUE}" d="${name.d}" transform="translate(${hNameX.toFixed(2)} ${hNameY.toFixed(2)})"/>
  <path fill="${SUB}" d="${hospital.d}" transform="translate(${hNameX.toFixed(2)} ${hHospY.toFixed(2)})"/>
`,
});

const iconOnly = svgWrap({
  w: icon.width,
  h: icon.height,
  title: "Nithya Hospital icon",
  body: icon.body,
});

// Circular sign, matching the wall badge.
const circle = 760;
const margin = 86;
const inner = circle - margin * 2;
const stackInnerH = icon.height + stackGapIcon + name.asc + stackGapWord + hospital.asc;
const scale = Math.min(inner / icon.width, (inner * 0.96) / stackInnerH);
const cIconW = icon.width * scale;
const cIconH = icon.height * scale;
const cName = renderText(semi, "NITHYA", nameSize * scale, nameSize * scale * 0.06);
const cHosp = renderFitted(medium, "HOSPITAL", hospitalSize * scale * 1.05, cName.width);
const blockH = cIconH + 34 * scale + cName.asc + 18 * scale + cHosp.asc;
const blockTop = (circle - blockH) / 2 - 8;
const cIconX = (circle - cIconW) / 2;
const cIconY = blockTop;
const cNameX = (circle - cName.width) / 2;
const cNameY = cIconY + cIconH + 34 * scale + cName.asc;
const cHospX = (circle - cHosp.width) / 2;
const cHospY = cNameY + 18 * scale + cHosp.asc;

const circleSvg = svgWrap({
  w: circle,
  h: circle,
  title: "Nithya Hospital",
  body: `
  <circle cx="${circle / 2}" cy="${circle / 2}" r="${circle / 2 - 2}" fill="#ffffff"/>
  <g transform="translate(${cIconX.toFixed(2)} ${cIconY.toFixed(2)}) scale(${scale.toFixed(4)})">${icon.body}</g>
  <path fill="${BLUE}" d="${cName.d}" transform="translate(${cNameX.toFixed(2)} ${cNameY.toFixed(2)})"/>
  <path fill="#B7C6D6" d="${cHosp.d}" transform="translate(${cHospX.toFixed(2)} ${cHospY.toFixed(2)})"/>
`,
});

// Favicon: icon centered on a white rounded tile.
const fav = 256;
const favScale = 168 / icon.width;
const favW = icon.width * favScale;
const favH = icon.height * favScale;
const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fav} ${fav}">
  <title>Nithya Hospital</title>
  <rect width="${fav}" height="${fav}" rx="56" fill="#ffffff"/>
  <g transform="translate(${((fav - favW) / 2).toFixed(2)} ${((fav - favH) / 2 - 4).toFixed(2)}) scale(${favScale.toFixed(4)})">${icon.body}</g>
</svg>
`;

fs.writeFileSync(path.join(outDir, "nithya-logo.svg"), stacked);
fs.writeFileSync(path.join(outDir, "nithya-logo-horizontal.svg"), horizontal);
fs.writeFileSync(path.join(outDir, "nithya-icon.svg"), iconOnly);
fs.writeFileSync(path.join(outDir, "nithya-logo-circle.svg"), circleSvg);
fs.writeFileSync(path.join(outDir, "favicon.svg"), favicon);

const preview = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Nithya logo preview</title>
<style>
  body { margin: 0; font-family: sans-serif; background: #f4f1ee; color: #333; }
  section { padding: 32px; }
  .row { display: flex; gap: 28px; align-items: center; flex-wrap: wrap; }
  .card { background: white; padding: 28px; border-radius: 16px; }
  .wood { background: #8d6b4a; }
  .navy { background: #16324f; }
  img { display: block; }
  h2 { font-weight: 500; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: #888; }
</style>
</head>
<body>
  <section>
    <h2>Circle on wood</h2>
    <div class="wood" style="display:inline-block;padding:40px;border-radius:12px">
      <img src="../logo/nithya-logo-circle.svg" width="420" height="420"/>
    </div>
  </section>
  <section>
    <h2>Stacked and horizontal</h2>
    <div class="row">
      <div class="card"><img src="../logo/nithya-logo.svg" width="280"/></div>
      <div class="card"><img src="../logo/nithya-logo-horizontal.svg" width="520"/></div>
      <div class="card"><img src="../logo/nithya-icon.svg" width="140"/></div>
      <div class="card"><img src="../logo/favicon.svg" width="96"/></div>
    </div>
  </section>
  <section class="navy">
    <h2 style="color:#9bb">On dark</h2>
    <img src="../logo/nithya-logo-horizontal.svg" width="480"/>
  </section>
</body>
</html>`;
fs.writeFileSync(path.join(__dirname, "preview.html"), preview);

console.log("icon", icon.width.toFixed(1), icon.height.toFixed(1));
console.log("stacked", stackW.toFixed(1), stackH.toFixed(1));
console.log("horizontal", hW.toFixed(1), hH.toFixed(1));
console.log("name width", name.width.toFixed(1), "hospital tracking check", hospital.width.toFixed(1));
console.log("wrote logo files");
