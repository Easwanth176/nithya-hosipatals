const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "..", "index.html");
let html = fs.readFileSync(file, "utf8");

const lines = [];
const line = (d, cls = "") => lines.push(`<path class="ln${cls ? " " + cls : ""}" pathLength="1" d="${d}"/>`);

line("M14 412H506");

// Curved glass tower
line("M58 412V156Q130 124 202 156V412");
const floors = [196, 236, 276, 316, 356];
line(floors.map((y) => `M58 ${y}Q130 ${y - 30} 202 ${y}`).join(""), "thin");
line([84, 108, 132, 156, 180].map((x) => {
  const t = (x - 58) / 144;
  const top = 156 - 4 * 32 * t * (1 - t);
  return `M${x} ${top.toFixed(1)}V412`;
}).join(""), "thin");
line("M52 156Q130 118 208 156");

// Main block
line("M202 412V118H424V412");
line("M196 118H430M206 104H420V118M206 104V118");
for (let y = 140; y <= 300; y += 40) {
  const row = [];
  for (let x = 220; x <= 388; x += 42) row.push(`M${x} ${y}h26v24h-26z`);
  line(row.join(""), "thin");
}

// Right wing
line("M424 412V214H500V412");
line("M418 214H506");
for (let y = 234; y <= 334; y += 34) line(`M436 ${y}h20v20h-20zM468 ${y}h20v20h-20z`, "thin");

// Entrance
line("M244 412V364H382V412");
line("M230 364H396L384 346H242Z");
line("M290 412V378H336V412M313 378V412", "thin");

// Signboard on roof
line("M268 104V86M358 104V86");
line("M250 86V54H376V86Z");

// Tree and kerb
line("M30 412V384M30 384c-14 0-18-22-4-28c-2-14 18-18 22-6c14-2 16 18 4 22c2 10-10 14-22 12z", "thin");
line("M440 412V396H500", "thin");

const letters = "NITHYA HOSPITAL";
const start = 313 - ((letters.length - 1) * 8.4) / 2;
const text = [...letters].map((ch, i) => ch === " " ? "" :
  `<text class="ltr" x="${(start + i * 8.4).toFixed(1)}" y="359">${ch}</text>`).join("");

const svg = `<!-- building:start -->
        <svg class="building" viewBox="0 0 520 430">
          <g class="lines">
            ${lines.join("\n            ")}
          </g>
          <g class="badge badge-tower">
            <circle cx="130" cy="236" r="34" fill="#ffffff" stroke="#f8659b" stroke-width="2"/>
            <image href="logo/nithya-logo.png" x="104" y="210" width="52" height="52"/>
          </g>
          <g class="badge badge-roof">
            <image href="logo/nithya-logo.png" x="292" y="56" width="42" height="28"/>
          </g>
          <g class="badge badge-wing">
            <circle cx="462" cy="186" r="15" fill="#ffffff" stroke="#025eea" stroke-width="2"/>
            <path d="M462 178v16M454 186h16" stroke="#f8659b" stroke-width="3" stroke-linecap="round"/>
          </g>
          <g class="name">${text}</g>
        </svg>
        <!-- building:end -->`;

const startTag = '<div class="hero-art zoom-in" aria-hidden="true">';
const altTag = '<div class="hero-art" aria-hidden="true">';
let open = html.indexOf(startTag);
let tag = startTag;
if (open === -1) { open = html.indexOf(altTag); tag = altTag; }
if (open === -1) throw new Error("hero-art not found");
const bodyStart = open + tag.length;
const close = html.indexOf("</div>", bodyStart);
html = html.slice(0, open) + altTag + "\n        " + svg + "\n      " + html.slice(close);
fs.writeFileSync(file, html);
console.log("paths", lines.length, "letters", letters.replace(/ /g, "").length);
