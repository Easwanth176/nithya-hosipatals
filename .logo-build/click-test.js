const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = "c:\\Users\\easwanth.konduru\\OneDrive\\Desktop\\Nithya\\.logo-build\\edge-cdp";
const shot = "c:\\Users\\easwanth.konduru\\OneDrive\\Desktop\\Nithya\\.logo-build\\site-interactive.png";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve(body));
    }).on("error", reject);
  });
}

const child = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  "--remote-debugging-port=9223",
  `--user-data-dir=${profile}`,
  "--window-size=1280,1600",
  "about:blank"
], { stdio: "ignore" });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  let list = "";
  for (let i = 0; i < 20; i++) {
    try {
      list = await get("http://127.0.0.1:9223/json");
      break;
    } catch (err) {
      await sleep(300);
    }
  }
  const pages = JSON.parse(list);
  const page = pages.find((item) => item.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  });
  function send(method, params = {}) {
    const msgId = ++id;
    return new Promise((resolve) => {
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await sleep(800);
  const result = await send("Runtime.evaluate", {
    expression: `(() => {
      document.querySelectorAll(".care-card")[1].click();
      document.querySelector("#choose-doctor").click();
      document.querySelector('.chip[data-value="Video"]').click();
      document.querySelector("#next").click();
      const day = document.querySelector('input[name="day"]');
      day.value = day.min;
      day.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector('.chip[data-value="Afternoon"]').click();
      document.querySelector("#next").click();
      return {
        step3: !document.querySelector("#panel-3").hidden,
        live: document.querySelector("#live-request").textContent,
        care: document.querySelectorAll(".care-card")[1].getAttribute("aria-pressed"),
        doctor: document.querySelector("#choose-doctor").getAttribute("aria-pressed"),
        error: document.querySelector("#form-error").textContent
      };
    })()`,
    returnByValue: true
  });
  const shotResult = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(shot, Buffer.from(shotResult.result.data, "base64"));
  console.log(JSON.stringify(result.result.result.value, null, 2));
  ws.close();
  child.kill();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  child.kill();
  process.exit(1);
});
