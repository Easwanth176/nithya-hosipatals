const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(file, "utf8");
const a = html.indexOf("<!-- building:start -->");
const b = html.indexOf("<!-- building:end -->");
if (a < 0 || b < 0) throw new Error("building markers not found");
const next = fs.readFileSync(path.join(__dirname, "building-v2.svg.txt"), "utf8");
fs.writeFileSync(file, html.slice(0, a) + next + html.slice(b));
console.log("building replaced");
