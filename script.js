/* ------------------------------------------------------------------
   1. YOUR CONTENT — edit this list, everything else updates itself.
   tab must be one of: projects | scripts | leaked | models
------------------------------------------------------------------- */

const ITEMS = [
  { title: "starfall",      tab: "projects", desc: "Small render engine I keep rewriting.", meta: "TypeScript", url: "#" },
  { title: "gutter",        tab: "projects", desc: "Log viewer that doesn't eat 2GB of RAM.", meta: "Rust", url: "#" },
  { title: "dotfiles",      tab: "scripts",  desc: "Arch setup, zsh config, the usual.", meta: "Shell", url: "#" },
  { title: "quickpatch",    tab: "scripts",  desc: "One-command patcher for local builds.", meta: "Python", url: "#" },
  { title: "archive-01",    tab: "leaked",   desc: "Add your own description here.", meta: "Archive", url: "#" },
  { title: "tiny-lm",       tab: "models",   desc: "1.2B params, trained on my own notes.", meta: "PyTorch", url: "#" },
  { title: "voxel-net",     tab: "models",   desc: "Depth estimation, 90MB, runs on CPU.", meta: "ONNX", url: "#" }
];

const LABELS = {
  projects: "Project",
  scripts: "Script",
  leaked: "Leaked",
  models: "Model"
};

/* ------------------------------------------------------------------
   2. Tabs
------------------------------------------------------------------- */

const grid = document.getElementById("grid");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const tabs = [...document.querySelectorAll(".tab")];

function render(tab) {
  const list = tab === "everything" ? ITEMS : ITEMS.filter(i => i.tab === tab);

  grid.innerHTML = list.map(i => `
    <li class="card">
      <h2><a href="${i.url}">${i.title}</a></h2>
      <p>${i.desc}</p>
      <div class="meta">
        <span class="kind">${LABELS[i.tab] || i.tab}</span>
        <span>${i.meta}</span>
      </div>
    </li>
  `).join("");

  empty.hidden = list.length > 0;
  grid.hidden = list.length === 0;
  count.textContent = `${list.length} ${list.length === 1 ? "entry" : "entries"}`;

  tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === tab)));
  history.replaceState(null, "", "#" + tab);
}

tabs.forEach((tab, idx) => {
  tab.addEventListener("click", () => render(tab.dataset.tab));

  // left/right arrows move between tabs
  tab.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(idx + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    render(next.dataset.tab);
  });
});

const start = location.hash.slice(1);
render(tabs.some(t => t.dataset.tab === start) ? start : "everything");

/* ------------------------------------------------------------------
   3. Cross cursor
------------------------------------------------------------------- */

const cursor = document.getElementById("cursor");
let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;

if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  addEventListener("mousemove", e => {
    tx = e.clientX;
    ty = e.clientY;
    cursor.classList.add("is-live");
    const over = e.target.closest("a, button");
    cursor.classList.toggle("is-hot", !!over);
  });

  addEventListener("mouseleave", () => cursor.classList.remove("is-live"));

  (function follow() {
    cx += (tx - cx) * 0.28;
    cy += (ty - cy) * 0.28;
    cursor.style.translate = `${cx}px ${cy}px`;
    requestAnimationFrame(follow);
  })();
}

/* ------------------------------------------------------------------
   4. Floating stars
------------------------------------------------------------------- */

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let stars = [];

function seed() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const n = Math.round((innerWidth * innerHeight) / 7000);
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.1 + 0.3,
    drift: Math.random() * 0.14 + 0.03,
    sway: Math.random() * Math.PI * 2,
    twinkle: Math.random() * Math.PI * 2
  }));
}

function draw(t) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (const s of stars) {
    if (!still) {
      s.y -= s.drift;
      s.sway += 0.005;
      if (s.y < -2) { s.y = innerHeight + 2; s.x = Math.random() * innerWidth; }
    }
    const alpha = still ? 0.6 : 0.35 + Math.sin(t / 900 + s.twinkle) * 0.3;
    ctx.beginPath();
    ctx.arc(s.x + Math.sin(s.sway) * 6, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(233, 236, 243, ${alpha.toFixed(3)})`;
    ctx.fill();
  }

  if (!still) requestAnimationFrame(draw);
}

seed();
draw(0);
addEventListener("resize", () => { seed(); if (still) draw(0); });
