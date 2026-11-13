const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "..", "index.html");
const old = fs.readFileSync(file, "utf8");
const a = old.indexOf("<!-- building:start -->");
const b = old.indexOf("<!-- building:end -->") + "<!-- building:end -->".length;
const building = old.slice(a, b)
  .replace(/stroke="#f8659b"/g, 'class="s-pink"')
  .replace(/stroke="#025eea"/g, 'class="s-blue"')
  .replace(/fill="#ffffff"/g, 'fill="#fff"')
  .replace(/logo\/nithya-logo(\.png|\.webp)/g, "logo/nithya-logo-180.webp");

const tpl = fs.readFileSync(path.join(__dirname, "index.template.html"), "utf8");
fs.writeFileSync(file, tpl.replace("<!-- BUILDING -->", building));
console.log("index.html written");
