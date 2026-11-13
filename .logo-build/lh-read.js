const r = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
for (const [k, c] of Object.entries(r.categories)) console.log(k, c.score === null ? "n/a" : Math.round(c.score * 100));
for (const id of ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]) {
  const a = r.audits[id];
  if (a) console.log(" ", id, a.displayValue || a.errorMessage || "");
}
console.log("--- failing audits");
for (const c of Object.values(r.categories)) {
  for (const ref of c.auditRefs) {
    const a = r.audits[ref.id];
    if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "manual") {
      const raw = a.details && a.details.items;
      const items = (Array.isArray(raw) ? raw : []).slice(0, 4).map((i) => (i.node && (i.node.selector || i.node.snippet)) || i.url || i.label || "").filter(Boolean);
      console.log(`[${c.id}] ${a.id} (${a.score}) ${a.displayValue || ""}`, items.length ? "\n    " + items.join("\n    ") : "");
    }
  }
}
