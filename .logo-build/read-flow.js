const s = require("fs").readFileSync(__dirname + "/flow-dom.html", "utf8");
const m = s.match(/<pre id="out">([\s\S]*?)<\/pre>/);
console.log(s.length, m ? m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") : "no pre");
