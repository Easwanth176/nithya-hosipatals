const s = require("fs").readFileSync(__dirname + "/../index.html", "utf8");
const bad = s.match(/Ã|â€|à°/g);
console.log({
  bom: s.charCodeAt(0) === 0xfeff,
  mojibake: bad ? bad.length : 0,
  ambulance: s.includes('class="ambulance"'),
  backdrop: s.includes('r="166"'),
  telugu: s.includes("తెలుగు"),
  buildings: s.split("<!-- building:start -->").length - 1
});
