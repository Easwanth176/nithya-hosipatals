const HOSPITAL_WHATSAPP = "919492735797";
const TEXT = window.NITHYA_TEXT;

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#site-nav");
const header = document.querySelector(".site-header");
const year = document.querySelector("#year");
const form = document.querySelector("#request");
const error = document.querySelector("#form-error");
const done = document.querySelector("#request-done");
const edit = document.querySelector("#edit-request");
const day = form.querySelector('input[name="day"]');
const live = document.querySelector("#live-request");
const careStatus = document.querySelector("#care-status");
const careCards = [...document.querySelectorAll(".care-card")];
const doctorButton = document.querySelector("#choose-doctor");
const panels = [...form.querySelectorAll("[data-panel]")];
const tabs = [...form.querySelectorAll(".progress button")];
const nextButton = document.querySelector("#next");
const backButton = document.querySelector("#back");
const submitButton = document.querySelector("#submit");
const copyButton = document.querySelector("#copy-address");
const address = document.querySelector("#hospital-address");
const langSwitch = document.querySelector("#lang-switch");
const sendWa = document.querySelector("#send-wa");

const state = { step: 1, concern: 0, mode: "", slot: "", doctor: false, reached: 1, error: "", lang: "en" };

function t(key, vars) {
  const value = (TEXT[state.lang] && TEXT[state.lang][key]) || TEXT.en[key] || key;
  return vars ? value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : value;
}

function field(name) {
  return form.querySelector(`[name="${name}"]`).value.trim();
}

year.textContent = String(new Date().getFullYear());

const today = new Date();
day.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

function formatDay(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(state.lang === "te" ? "te-IN" : "en-IN", {
    weekday: "short", day: "numeric", month: "short"
  });
}

function concernName() {
  return state.concern ? t(`care.${state.concern}.t`) : "";
}

function whenText() {
  return [formatDay(day.value), state.slot ? t(`opt.${state.slot}`) : ""].filter(Boolean).join(", ");
}

function renderError() {
  error.hidden = !state.error;
  error.textContent = state.error ? t(state.error) : "";
}

function setError(key) {
  state.error = key;
  renderError();
}

function renderSummary() {
  const bits = [concernName(), state.mode ? t(`opt.${state.mode}`) : "", whenText(), state.doctor ? t("doc.name") : ""].filter(Boolean);
  live.textContent = bits.length ? bits.join(" · ") : t("live.empty");
  careStatus.textContent = state.concern ? t("care.status.on", { x: concernName() }) : t("care.status");
}

function applyLanguage(lang) {
  state.lang = TEXT[lang] ? lang : "en";
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = t(node.dataset.i18n);
    if (node.textContent.trim() !== value) node.textContent = value;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    const value = t(node.dataset.i18nHtml);
    if (node.innerHTML.trim() !== value) node.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const value = t(node.dataset.i18nAria);
    if (node.getAttribute("aria-label") !== value) node.setAttribute("aria-label", value);
  });
  const other = state.lang === "en" ? "te" : "en";
  langSwitch.textContent = t("lang.switch");
  langSwitch.lang = other;
  renderSummary();
  renderError();
  if (!done.hidden) renderDone();
  try { localStorage.setItem("nithya-lang", state.lang); } catch (err) { /* storage may be blocked */ }
}

langSwitch.addEventListener("click", () => applyLanguage(state.lang === "en" ? "te" : "en"));

function showStep(step) {
  state.step = step;
  panels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.panel) !== step;
  });
  tabs.forEach((tab) => {
    const tabStep = Number(tab.id.replace("tab-", ""));
    tab.setAttribute("aria-selected", tabStep === step ? "true" : "false");
    tab.disabled = tabStep > state.reached;
  });
  backButton.hidden = step === 1;
  nextButton.hidden = step === 3;
  submitButton.hidden = step !== 3;
  setError("");
  renderSummary();
}

function validate(step) {
  if (step === 1 && !state.mode) return "err.mode";
  if (step === 2 && (!day.value || !state.slot)) return "err.time";
  if (step === 3) {
    if (field("name").length < 2) return "err.name";
    if (field("phone").replace(/\D/g, "").length < 10) return "err.phone";
    if (field("note").length < 8) return "err.note";
  }
  return "";
}

function requestValues() {
  return {
    concern: concernName() || t("val.none"),
    mode: t(`opt.${state.mode}`),
    when: whenText(),
    doctor: state.doctor ? t("doc.name") : t("val.anyDoctor"),
    name: field("name"),
    phone: field("phone"),
    note: field("note")
  };
}

function renderDone() {
  const values = requestValues();
  done.querySelectorAll("[data-field]").forEach((node) => {
    node.textContent = values[node.dataset.field];
  });
  const lines = [
    t("wa.intro"),
    "",
    ...["concern", "mode", "when", "doctor", "name", "phone", "note"].map((key) => `${t(`dt.${key}`)}: ${values[key]}`)
  ];
  sendWa.href = `https://wa.me/${HOSPITAL_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}

menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", open ? "true" : "false");
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-compact", window.scrollY > 16);
}, { passive: true });

const sectionLinks = [...nav.querySelectorAll("a[href^='#']")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach((link) => link.removeAttribute("aria-current"));
    const current = nav.querySelector(`a[href="#${entry.target.id}"]`);
    if (current) current.setAttribute("aria-current", "true");
  });
}, { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 });
sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean)
  .forEach((section) => spy.observe(section));

careCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    const on = card.getAttribute("aria-pressed") === "true";
    careCards.forEach((item) => item.setAttribute("aria-pressed", "false"));
    card.setAttribute("aria-pressed", on ? "false" : "true");
    state.concern = on ? 0 : index + 1;
    renderSummary();
  });
});

doctorButton.addEventListener("click", () => {
  state.doctor = doctorButton.getAttribute("aria-pressed") !== "true";
  doctorButton.setAttribute("aria-pressed", state.doctor ? "true" : "false");
  renderSummary();
});

form.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const group = chip.dataset.group;
    form.querySelectorAll(`.chip[data-group="${group}"]`).forEach((item) => {
      item.setAttribute("aria-pressed", "false");
    });
    chip.setAttribute("aria-pressed", "true");
    state[group] = chip.dataset.value;
    setError("");
    renderSummary();
  });
});

day.addEventListener("change", () => {
  setError("");
  renderSummary();
});

nextButton.addEventListener("click", () => {
  const problem = validate(state.step);
  if (problem) {
    setError(problem);
    return;
  }
  state.reached = Math.max(state.reached, state.step + 1);
  showStep(state.step + 1);
});

backButton.addEventListener("click", () => showStep(state.step - 1));

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = Number(tab.id.replace("tab-", ""));
    if (target > state.reached) return;
    if (target > state.step) {
      const problem = validate(state.step);
      if (problem) {
        setError(problem);
        return;
      }
    }
    showStep(target);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const problem = validate(3);
  if (problem) {
    setError(problem);
    return;
  }
  renderDone();
  form.hidden = true;
  done.hidden = false;
  done.querySelector("h3").focus();
});

edit.addEventListener("click", () => {
  done.hidden = true;
  form.hidden = false;
  showStep(3);
  form.querySelector('[name="name"]').focus();
});

copyButton.addEventListener("click", async () => {
  const text = address.innerText.replace(/\s*\n\s*/g, ", ").trim();
  let key = "visit.copied";
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    key = "visit.copyFail";
  }
  copyButton.textContent = t(key);
  window.setTimeout(() => {
    copyButton.textContent = t("visit.copy");
  }, 1600);
});

let savedLang = "en";
try { savedLang = localStorage.getItem("nithya-lang") || "en"; } catch (err) { /* storage may be blocked */ }
applyLanguage(new URLSearchParams(location.search).get("lang") || savedLang);
showStep(1);

const track = document.querySelector("#care-track");
const prev = document.querySelector("#care-prev");
const next = document.querySelector("#care-next");
const dotsHolder = document.querySelector("#care-dots");
const slides = [...track.children];

function slideWidth() {
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return slides[0].getBoundingClientRect().width + gap;
}

function pageCount() {
  const perView = Math.max(1, Math.round(track.clientWidth / slideWidth()));
  return Math.max(1, slides.length - perView + 1);
}

function syncSlider() {
  const index = Math.round(track.scrollLeft / slideWidth());
  prev.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  [...dotsHolder.children].forEach((dot, i) => dot.classList.toggle("is-on", i === Math.min(index, pageCount() - 1)));
}

function renderDots() {
  dotsHolder.textContent = "";
  for (let i = 0; i < pageCount(); i++) dotsHolder.append(document.createElement("span"));
  syncSlider();
}

prev.addEventListener("click", () => track.scrollBy({ left: -slideWidth(), behavior: "smooth" }));
next.addEventListener("click", () => track.scrollBy({ left: slideWidth(), behavior: "smooth" }));
track.addEventListener("scroll", () => window.requestAnimationFrame(syncSlider), { passive: true });
window.addEventListener("resize", renderDots);
renderDots();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const building = document.querySelector(".building");
if (building) {
  if (reduceMotion) {
    building.classList.add("is-done");
  } else {
    const at = (selector, start, gap = 0) => {
      building.querySelectorAll(selector).forEach((node, i) => node.style.setProperty("--t", `${start + i * gap}ms`));
    };
    const strokes = building.querySelectorAll(".ln");
    const drawn = 400 + strokes.length * 60 + 700;
    at(".backdrop", 0, 250);
    at(".cloud", 500, 400);
    at(".ln", 400, 60);
    at(".wash", drawn - 500);
    at(".lane", drawn - 300);
    at(".win", drawn - 200, 18);
    building.querySelectorAll(".win.lit").forEach((win, i) => {
      win.style.setProperty("--lit", `${drawn + 500 + ((i * 7) % 15) * 110}ms`);
    });
    at(".ambulance", drawn);
    at(".beacon", drawn + 2000);
    at(".bird", drawn + 300);
    at(".badge", drawn + 500, 260);
    at(".ltr", drawn + 1000, 45);
    at(".walker", drawn + 1300, 220);

    const replay = document.querySelector("#replay");
    const finished = drawn + 1300 + 220 + 2600;
    let replayTimer = 0;
    const play = () => {
      replay.hidden = true;
      if (building.classList.contains("is-drawing")) {
        building.classList.remove("is-drawing");
        void building.getBoundingClientRect();
      }
      building.classList.add("is-drawing");
      window.clearTimeout(replayTimer);
      replayTimer = window.setTimeout(() => { replay.hidden = false; }, finished);
    };
    replay.addEventListener("click", play);
    requestAnimationFrame(play);

    const art = building.closest(".hero-art");
    const layers = [...building.querySelectorAll(".layer")];
    if (window.matchMedia("(hover: hover)").matches) {
      art.addEventListener("pointermove", (event) => {
        const box = art.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        layers.forEach((layer) => {
          const depth = Number(layer.dataset.depth);
          layer.style.transform = `translate(${x * depth}px, ${y * depth * 0.6}px)`;
        });
      });
      art.addEventListener("pointerleave", () => {
        layers.forEach((layer) => { layer.style.transform = ""; });
      });
    }
  }
}

if (!reduceMotion) {
  const riseItems = document.querySelectorAll(".band-head, #doctors .band-intro, #choose-doctor, #consultation .band-intro, .request, #prepare .band-intro, .prep-card, #questions .band-intro, .faq, #visit .band-intro, .visit-card, .map-frame");
  const riseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      riseObserver.unobserve(entry.target);
    });
  }, { threshold: 0.18 });
  riseItems.forEach((item, index) => {
    item.classList.add("rise");
    item.style.setProperty("--d", `${(index % 4) * 70}ms`);
    riseObserver.observe(item);
  });
}
