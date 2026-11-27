// Gravity golf, playable. One launch per attempt: pick an angle and a speed, and gravity does the rest.
"use strict";

(() => {
  const SKY_TOP = "#0d1230", SKY_BOT = "#03040b";
  const NEBULA = ["#1d5c7a", "#5d2d74", "#2a3f8f"];
  const PORTAL = "#b18cff", PORTAL_RIM = "#f1e8ff", PORTAL_CORE = "#120a24";
  const SHOT = { 0: "#b9a6ff", 1: "#ffd27f", 2: "#ff7a59", 3: "#8fd8ff" };
  const WHO = { you: "#ffd27f", ai: "#6fe0ff", opt: "#ff8fd0" };
  const PLANETS = [
    ["#e3b27a", "#a8643a", "#f4dcb4", "#ffc38a", true], ["#7cc5c9", "#2f6f86", "#c9f0ee", "#8fe8ff", true],
    ["#b0583f", "#5e2a22", "#d98a63", "#ff9b7a", false], ["#2f6fb3", "#1f8a6a", "#e8f2ff", "#8cc8ff", false],
    ["#dfe9f7", "#9fb6d6", "#ffffff", "#cfe6ff", false], ["#8d8a86", "#4a4846", "#bdb8b0", "#c8c8d8", false],
  ];
  const STORE = "gravity-golf-v1";

  const $ = (id) => document.getElementById(id);
  const canvas = $("court"), ctx = canvas.getContext("2d");
  let game, hole, holeIdx = 0, S = 600, bg = null;
  let theta = 0, logv = 0, flight = null, flightWho = null, trail = [], ghosts = [], fast = false, rafId = 0;
  let attempts = 0, message = "";
  let save = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) { /* private mode: progress is not kept */ }
  }

  // ---- coordinates ------------------------------------------------------------------------------------------
  const W = () => game.box;
  const px = (x) => (x + W()) / (2 * W()) * S;
  const py = (y) => (W() - y) / (2 * W()) * S;
  const pr = (r) => r / (2 * W()) * S;
  const wx = (p) => p / S * 2 * W() - W();
  const wy = (p) => W() - p / S * 2 * W();

  function rng(seed) {                                   // small deterministic generator per hole
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // ---- the course picture (drawn once per hole into an offscreen canvas) -----------------------------------
  function drawBackground() {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    const R = rng(1000 + hole.n);
    let grd = g.createLinearGradient(0, 0, 0, S);
    grd.addColorStop(0, SKY_TOP); grd.addColorStop(1, SKY_BOT);
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 7; k++) {                         // nebula
      const x = R() * S, y = R() * S, r = (0.25 + 0.35 * R()) * S;
      const n = g.createRadialGradient(x, y, 0, x, y, r);
      n.addColorStop(0, NEBULA[k % 3] + "40"); n.addColorStop(1, NEBULA[k % 3] + "00");
      g.fillStyle = n; g.fillRect(0, 0, S, S);
    }
    for (let k = 0; k < 900; k++) {                       // stars
      const x = R() * S, y = R() * S, b = R();
      g.fillStyle = `rgba(255,255,255,${0.15 + 0.6 * b * b})`;
      const s = b > 0.985 ? 1.8 : b > 0.9 ? 1.2 : 0.7;
      g.fillRect(x, y, s, s);
      if (b > 0.993) {
        g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 0.6;
        g.beginPath(); g.moveTo(x - 5, y + s / 2); g.lineTo(x + 5 + s, y + s / 2);
        g.moveTo(x + s / 2, y - 5); g.lineTo(x + s / 2, y + 5 + s); g.stroke();
      }
    }
    // faint equipotential lines: where log(-phi) crosses a level between neighbouring pixels
    const n = S, lev = new Float32Array(n * n);                     // one level per pixel
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = wx((j + 0.5) * S / n), y = wy((i + 0.5) * S / n);
      let phi = 0;
      for (const b of hole.bodies) phi += b[2] / Math.max(Math.hypot(b[0] - x, b[1] - y), b[3]);
      lev[i * n + j] = Math.floor(Math.log(phi) / 0.28);
    }
    const img = g.getImageData(0, 0, S, S), d = img.data, sc = S / n;
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < n - 1; j++) {
      const a = lev[i * n + j];
      if (a !== lev[i * n + j + 1] || a !== lev[(i + 1) * n + j]) {
        for (let u = 0; u < sc; u++) for (let v = 0; v < sc; v++) {
          const q = ((Math.floor(i * sc + u)) * S + Math.floor(j * sc + v)) * 4;
          d[q] += (134 - d[q]) * 0.13; d[q + 1] += (212 - d[q + 1]) * 0.13; d[q + 2] += (255 - d[q + 2]) * 0.13;
        }
      }
    }
    g.putImageData(img, 0, 0);
    // hole
    const hx = px(hole.hole[0]), hy = py(hole.hole[1]), rh = pr(game.r_hole);
    grd = g.createRadialGradient(hx, hy, rh * 0.8, hx, hy, rh * 4);
    grd.addColorStop(0, PORTAL + "88"); grd.addColorStop(1, PORTAL + "00");
    g.fillStyle = grd; g.beginPath(); g.arc(hx, hy, rh * 4, 0, 7); g.fill();
    g.fillStyle = PORTAL_CORE; g.beginPath(); g.arc(hx, hy, rh, 0, 7); g.fill();
    g.strokeStyle = PORTAL_RIM; g.lineWidth = 1.6; g.beginPath(); g.arc(hx, hy, rh, 0, 7); g.stroke();
    // bodies
    hole.bodies.forEach((b, k) => (b[4] ? drawStar : drawPlanet)(g, b, rng(7 * hole.n + k)));
    // tee
    const tx = px(game.tee[0]), ty = py(game.tee[1]);
    grd = g.createRadialGradient(tx, ty, 0, tx, ty, 12);
    grd.addColorStop(0, "rgba(255,240,210,0.8)"); grd.addColorStop(1, "rgba(255,240,210,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(tx, ty, 12, 0, 7); g.fill();
    g.fillStyle = "#fff6e0"; g.beginPath(); g.arc(tx, ty, 3, 0, 7); g.fill();
    bg = c;
  }

  function drawPlanet(g, b, R) {
    const x = px(b[0]), y = py(b[1]), r = pr(b[3]);
    const pool = PLANETS.filter((p) => p[4] === (b[2] > 0.09));
    const [c0, c1, c2, atmo] = pool[Math.floor(R() * pool.length)];
    let grd = g.createRadialGradient(x, y, r * 0.9, x, y, r * 1.8);
    grd.addColorStop(0, atmo + "55"); grd.addColorStop(1, atmo + "00");
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r * 1.8, 0, 7); g.fill();
    grd = g.createRadialGradient(x - 0.35 * r, y - 0.35 * r, 0.05 * r, x, y, r);
    grd.addColorStop(0, c2); grd.addColorStop(0.45, c0); grd.addColorStop(1, c1);
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    if (b[2] > 0.09) {                                    // gas giant bands
      g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip();
      for (let k = -3; k <= 3; k++) {
        g.fillStyle = (k % 2 ? c1 : c2) + "30";
        g.fillRect(x - r, y + k * r * 0.28 - r * 0.07, 2 * r, r * 0.14 * (0.6 + R()));
      }
      g.restore();
    }
    grd = g.createRadialGradient(x + 0.4 * r, y + 0.4 * r, 0.2 * r, x, y, r * 1.05);
    grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(1, "rgba(0,0,10,0.55)");
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }

  function drawStar(g, b) {
    const x = px(b[0]), y = py(b[1]), r = pr(b[3]);
    const grd = g.createRadialGradient(x, y, r * 0.8, x, y, r * 8);
    grd.addColorStop(0, "rgba(255,233,168,0.55)"); grd.addColorStop(0.25, "rgba(255,233,168,0.16)");
    grd.addColorStop(1, "rgba(255,233,168,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, r * 8, 0, 7); g.fill();
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(x, y, r * 1.05, 0, 7); g.fill();
    g.setLineDash([3, 5]); g.strokeStyle = "rgba(255,246,216,0.28)"; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y, pr(game.touch * b[3]), 0, 7); g.stroke(); g.setLineDash([]);
  }

  // ---- per-frame drawing ------------------------------------------------------------------------------------
  function drawTrail(points, color, alpha, width) {
    if (points.length < 2) return;
    const n = points.length;
    for (let i = 1; i < n; i++) {
      const k = i / n;
      ctx.strokeStyle = color; ctx.globalAlpha = alpha * (0.12 + 0.88 * k ** 1.5);
      ctx.lineWidth = width * (0.35 + 0.65 * k);
      ctx.beginPath(); ctx.moveTo(px(points[i - 1][0]), py(points[i - 1][1])); ctx.lineTo(px(points[i][0]), py(points[i][1]));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.drawImage(bg, 0, 0);
    for (const gh of ghosts) drawTrail(gh.points, SHOT[gh.outcome], 0.35, 1.4);
    if (flight) {
      const col = WHO[flightWho];
      drawTrail(trail, col, 1, 2.6);
      // touched stars flash
      hole.bodies.forEach((b, k) => {
        if (b[4] && flight.rmin[k] < game.touch * b[3]) {
          ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(px(b[0]), py(b[1]), pr(game.touch * b[3]), 0, 7); ctx.stroke(); ctx.setLineDash([]);
        }
      });
      const x = px(flight.x), y = py(flight.y);
      if (flight.outcome === GG.SUNK) {
        for (const [r, a] of [[26, 0.08], [15, 0.18], [7, 0.4]]) {
          ctx.fillStyle = col; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (flight.outcome === GG.CRASH) {
        ctx.strokeStyle = SHOT[2];
        for (let k = 0; k < 9; k++) {
          const a = k * 0.7, L = 6 + 6 * ((k * 37) % 5) / 5;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L * Math.cos(a), y + L * Math.sin(a)); ctx.stroke();
        }
      }
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill();
    }
    if (!flight || flight.outcome !== null) drawAim();
  }

  function drawAim() {
    const v = Math.exp(logv), [v0, v1] = game.v_range;
    const len = 0.1 + 0.32 * (logv - Math.log(v0)) / (Math.log(v1) - Math.log(v0));
    const tx = game.tee[0], ty = game.tee[1];
    const ex = tx + len * Math.cos(theta), ey = ty + len * Math.sin(theta);
    ctx.strokeStyle = "rgba(255,246,224,0.85)"; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(px(tx), py(ty)); ctx.lineTo(px(ex), py(ey)); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.atan2(py(ey) - py(ty), px(ex) - px(tx));
    ctx.fillStyle = "rgba(255,246,224,0.95)";
    ctx.beginPath(); ctx.moveTo(px(ex), py(ey));
    ctx.lineTo(px(ex) - 11 * Math.cos(a - 0.4), py(ey) - 11 * Math.sin(a - 0.4));
    ctx.lineTo(px(ex) - 11 * Math.cos(a + 0.4), py(ey) - 11 * Math.sin(a + 0.4)); ctx.fill();
    ctx.font = "12px Inter, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,246,224,0.9)";
    ctx.fillText(`${(theta * 180 / Math.PI).toFixed(2)}°  ·  speed ${v.toFixed(3)}`, px(tx) - 30, py(ty) + 28);
  }

  // ---- flight -----------------------------------------------------------------------------------------------
  function launch(who) {
    if (flight && flight.outcome === null) return;
    cancelAnimationFrame(rafId);
    if (who === "you") {
      attempts += 1;
      flight = new GG.Flight(game, hole, theta, Math.exp(logv));
    } else {
      const s = hole[who];
      flight = new GG.Flight(game, hole, 0, 0, { vx: s.vx, vy: s.vy });
    }
    flightWho = who; trail = [[flight.x, flight.y]];
    message = who === "you" ? `Attempt ${attempts}…` : who === "ai" ? "The trained network's one shot…" : "The optimizer's shot…";
    status();
    const tick = () => {
      for (let k = 0; k < (fast ? 15 : 3) && flight.outcome === null; k++) {   // a trail point every 4 steps
        flight.step(4);
        trail.push([flight.x, flight.y]);
      }
      draw();
      if (flight.outcome === null) rafId = requestAnimationFrame(tick);
      else finish(who);
    };
    rafId = requestAnimationFrame(tick);
  }

  function finish(who) {
    const oc = flight.outcome, stars = flight.starsTouched(game.touch);
    const starTxt = hole.kind === "stars" ? (oc === GG.SUNK ? ` touching ${stars} star${stars === 1 ? "" : "s"}` : "") : "";
    if (who === "you") {
      ghosts.push({ points: trail.filter((_, i) => i % 2 === 0), outcome: oc });
      if (ghosts.length > 6) ghosts.shift();
      const best = save[hole.n] || {};
      if (oc === GG.SUNK) {
        if (!best.sunk || attempts < best.sunk) best.sunk = attempts;
        if (hole.kind === "stars" && (best.stars === undefined || stars > best.stars)) best.stars = stars;
        save[hole.n] = best; persist();
        message = `Sunk on attempt ${attempts}${starTxt}!` + (hole.ai.outcome !== "sunk" ? " You beat the AI on this hole." : "");
      } else {
        message = { 0: "Still flying when time ran out.", 2: "Crashed.", 3: "Out of bounds." }[oc] +
          ` Closest approach to the hole: ${flight.dmin.toFixed(3)} (the hole's radius is ${game.r_hole}).`;
      }
    } else {
      const name = who === "ai" ? "The network" : "The optimizer";
      message = `${name}: ${GG.NAMES[oc]}${starTxt}` + (who === "opt" && hole.opt.tries ? `, found after ${hole.opt.tries} simulated tries.` : ".");
    }
    status(); draw();
  }

  // ---- controls ---------------------------------------------------------------------------------------------
  function setAim(t, lv) {
    theta = Math.atan2(Math.sin(t), Math.cos(t));
    const [v0, v1] = game.v_range;
    logv = Math.min(Math.log(v1), Math.max(Math.log(v0), lv));
    $("angle").value = (theta * 180 / Math.PI).toFixed(2);
    $("speed").value = ((logv - Math.log(v0)) / (Math.log(v1) - Math.log(v0)) * 1000).toFixed(0);
    $("angle-out").textContent = `${(theta * 180 / Math.PI).toFixed(2)}°`;
    $("speed-out").textContent = Math.exp(logv).toFixed(3);
    if (!flight || flight.outcome !== null) draw();
  }

  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (flight && flight.outcome === null) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.offsetX, y: e.offsetY };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const sx = canvas.clientWidth / S;                   // CSS px per canvas px
    const dx = (drag.x - e.offsetX) / sx, dy = (drag.y - e.offsetY) / sx;      // pull back to aim forward
    if (Math.hypot(dx, dy) < 4) return;
    const [v0, v1] = game.v_range;
    const frac = Math.min(1, Math.hypot(dx, dy) / (0.4 * S));
    setAim(Math.atan2(-dy, dx), Math.log(v0) + frac * (Math.log(v1) - Math.log(v0)));
  });
  canvas.addEventListener("pointerup", () => { drag = null; });

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" && e.target.type === "number") return;
    const big = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") setAim(theta + big * 0.0005, logv);
    else if (e.key === "ArrowRight") setAim(theta - big * 0.0005, logv);
    else if (e.key === "ArrowUp") setAim(theta, logv + big * 0.002);
    else if (e.key === "ArrowDown") setAim(theta, logv - big * 0.002);
    else if (e.key === " " || e.key === "Enter") launch("you");
    else if (e.key === "f") { fast = !fast; $("fast").checked = fast; return; }
    else return;
    e.preventDefault();
  });
  $("angle").addEventListener("input", (e) => setAim(parseFloat(e.target.value) * Math.PI / 180, logv));
  $("speed").addEventListener("input", (e) => {
    const [v0, v1] = game.v_range;
    setAim(theta, Math.log(v0) + parseFloat(e.target.value) / 1000 * (Math.log(v1) - Math.log(v0)));
  });
  $("launch").addEventListener("click", () => launch("you"));
  $("show-ai").addEventListener("click", () => launch("ai"));
  $("show-opt").addEventListener("click", () => launch("opt"));
  $("prev").addEventListener("click", () => setHole(holeIdx - 1));
  $("next").addEventListener("click", () => setHole(holeIdx + 1));
  $("fast").addEventListener("change", (e) => { fast = e.target.checked; });
  $("clear").addEventListener("click", () => { ghosts = []; flight = null; draw(); });

  // ---- holes ------------------------------------------------------------------------------------------------
  function describe(h) {
    if (h.kind === "stars") return "Three stars and a blocker. Sinking scores; brushing each star on the way (inside its dashed ring) earns a bonus.";
    return `${h.N} planet${h.N > 1 ? "s" : ""}. ` + (h.ai.outcome === "sunk" ? "The trained network sinks this hole in one shot." :
      "The trained network misses this one.");
  }

  function setHole(i) {
    holeIdx = (i + game.holes.length) % game.holes.length;
    hole = game.holes[holeIdx];
    cancelAnimationFrame(rafId);
    flight = null; ghosts = []; attempts = 0; message = "";
    drawBackground();
    const hx = hole.hole[0] - game.tee[0], hy = hole.hole[1] - game.tee[1];
    setAim(Math.atan2(hy, hx), Math.log(1.2));
    $("hole-title").textContent = `Hole ${hole.n} of ${game.holes.length}`;
    $("hole-desc").textContent = describe(hole);
    renderPicker(); status();
    try { history.replaceState(null, "", `#${hole.n}`); } catch (e) { /* file:// */ }
  }

  function status() {
    $("message").textContent = message || "Drag on the course to aim (pull back like a slingshot), fine-tune with the sliders or arrow keys, then Launch.";
    const b = save[hole.n];
    $("best").textContent = b && b.sunk ? `Your best: sunk in ${b.sunk} attempt${b.sunk > 1 ? "s" : ""}` +
      (hole.kind === "stars" ? `, ${b.stars} star${b.stars === 1 ? "" : "s"}` : "") : "Not sunk yet";
    const sunk = Object.keys(save).filter((k) => save[k].sunk).length;
    const beat = game.holes.filter((h) => save[h.n] && save[h.n].sunk && h.ai.outcome !== "sunk").length;
    $("totals").textContent = `${sunk} of ${game.holes.length} holes sunk · ${beat} where the network missed`;
  }

  function renderPicker() {
    const box = $("picker");
    box.innerHTML = "";
    game.holes.forEach((h, k) => {
      const b = document.createElement("button");
      b.textContent = h.n;
      b.className = "pick" + (k === holeIdx ? " on" : "") + (save[h.n] && save[h.n].sunk ? " done" : "") +
        (h.kind === "stars" ? " star" : "");
      b.title = h.kind === "stars" ? "triple-star hole" : `${h.N} planet${h.N > 1 ? "s" : ""}` +
        (h.ai.outcome !== "sunk" ? " · the network misses" : "");
      b.addEventListener("click", () => setHole(k));
      box.appendChild(b);
    });
  }

  function resize() {
    const w = Math.min(canvas.parentElement.clientWidth, 720);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    S = Math.round(w * dpr);
    canvas.width = canvas.height = S;
    canvas.style.width = canvas.style.height = `${w}px`;
    if (hole) { drawBackground(); draw(); }
  }
  window.addEventListener("resize", () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });

  fetch("courses.json").then((r) => r.json()).then((data) => {
    game = data;
    resize();
    const want = parseInt(location.hash.slice(1), 10);
    setHole(want >= 1 && want <= game.holes.length ? want - 1 : 0);
  });
})();
