// Field browser: real SDSS fields with every detected source, what the final classifier calls it, and how
// unfamiliar it looks. Data: fields.json (COMP2026 finalarc_step6_browser_export.py).
"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = $("field"), ctx = canvas.getContext("2d");
  const stamp = $("stamp"), sctx = stamp.getContext("2d");
  const STAR = "#6fe0ff", GAL = "#ffb347", FLAG = "#ff5d7a";
  const NF = 360, HW = 60;                                   // field size, half window
  let data, byField = [], fi = 0, sel = null, img = new Image(), S = 600;

  const fmt = (v, d = 3) => (v === null || v === undefined) ? "—" : Number(v).toFixed(d);

  function resize() {
    const w = Math.min(canvas.parentElement.clientWidth, 720);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    S = Math.round(w * dpr);
    canvas.width = canvas.height = S;
    canvas.style.width = canvas.style.height = `${w}px`;
    draw();
  }

  function draw() {
    if (!img.complete || !img.naturalWidth) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, S, S);
    const k = S / NF;
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.strokeRect(HW * k, HW * k, (NF - 2 * HW) * k, (NF - 2 * HW) * k); ctx.setLineDash([]);
    for (const d of byField[fi]) {
      const x = (d.x + 0.5) * k, y = (d.y + 0.5) * k, r = 7 * k;
      const col = d.p > 0.5 ? STAR : GAL;
      ctx.lineWidth = d === sel ? 3 : d.dom ? 1.8 : 1;
      ctx.globalAlpha = d.dom ? 1 : 0.6;
      ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
      if (d.s.mahalanobis[2]) {
        ctx.strokeStyle = FLAG; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, r + 4 * k, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
    }
    if (sel) {                                                // the network's window
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1;
      ctx.strokeRect((sel.x - HW) * k, (sel.y - HW) * k, 2 * HW * k, 2 * HW * k);
    }
  }

  function showSource(d) {
    sel = d; draw();
    $("source").hidden = false;
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(img, d.x - HW, d.y - HW, 2 * HW, 2 * HW, 0, 0, stamp.width, stamp.height);
    const ps = d.p, pg = 1 - d.p;
    $("call").textContent = `called: ${ps > 0.5 ? "star" : "galaxy"}`;
    $("bar-star").style.width = `${100 * ps}%`; $("bar-gal").style.width = `${100 * pg}%`;
    $("p-star").textContent = ps.toFixed(3); $("p-gal").textContent = pg.toFixed(3);
    const rows = [["1 − max softmax", "msp"], ["energy", "energy"], ["Mahalanobis", "mahalanobis"]];
    $("scores").innerHTML = rows.map(([lab, k]) => {
      const [v, pc, flag] = d.s[k];
      return `<tr><td>${lab}</td><td>${fmt(v, k === "mahalanobis" ? 0 : 3)}</td><td>${pc.toFixed(0)}th</td>` +
        `<td>${flag ? '<b class="flag">unfamiliar</b>' : "typical"}</td></tr>`;
    }).join("");
    $("sdss").textContent = (d.gz ? "the central Galaxy Zoo galaxy; " : "") +
      (d.sdss === "none" ? "no SDSS catalog object within 3 px" : `SDSS catalog: ${d.sdss}` + (d.r ? `, r = ${d.r}` : "")) +
      (d.dom ? "" : " · a brighter object sits elsewhere in its window");
    $("note").textContent = d.note ? `Sorted by eye as: ${d.note}` : "";
    try { history.replaceState(null, "", `#f=${fi}&d=${d.id}`); } catch (e) { /* file:// */ }
  }

  function setField(i, pick) {
    fi = (i + data.fields.length) % data.fields.length;
    sel = null; $("source").hidden = true;
    const f = data.fields[fi];
    $("field-title").textContent = `Field ${fi + 1} of ${data.fields.length}`;
    $("field-meta").textContent = `RA ${f.ra.toFixed(4)}°, Dec ${f.dec.toFixed(4)}° · ${byField[fi].length} detected sources ` +
      `(${byField[fi].filter((d) => d.p > 0.5).length} called star)`;
    img = new Image();
    img.onload = () => { draw(); if (pick !== undefined) showSource(data.dets[pick]); };
    img.src = `img/${f.name}.jpg`;
    try { history.replaceState(null, "", `#f=${fi}`); } catch (e) { /* file:// */ }
  }

  canvas.addEventListener("click", (e) => {
    const k = canvas.clientWidth / NF;
    const x = e.offsetX / k, y = e.offsetY / k;
    let best = null, bd = 14;
    for (const d of byField[fi]) {
      const dd = Math.hypot(d.x + 0.5 - x, d.y + 0.5 - y);
      if (dd < bd) { bd = dd; best = d; }
    }
    if (best) showSource(best);
  });
  $("prev").addEventListener("click", () => setField(fi - 1));
  $("next").addEventListener("click", () => setField(fi + 1));
  $("random").addEventListener("click", () => setField(Math.floor(Math.random() * data.fields.length)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") setField(fi - 1); else if (e.key === "ArrowRight") setField(fi + 1);
  });
  window.addEventListener("resize", () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });

  fetch("fields.json").then((r) => r.json()).then((d) => {
    data = d;
    byField = data.fields.map(() => []);
    for (const det of data.dets) byField[det.f].push(det);
    $("strange").innerHTML = "";
    data.strange.forEach((j, n) => {
      const det = data.dets[j];
      const b = document.createElement("button");
      b.className = "pick"; b.textContent = n + 1;
      b.title = det.note || `field ${det.f + 1}`;
      b.addEventListener("click", () => setField(det.f, j));
      $("strange").appendChild(b);
    });
    resize();
    const m = /f=(\d+)(?:&d=(\d+))?/.exec(location.hash);
    if (m) setField(parseInt(m[1], 10), m[2] !== undefined ? parseInt(m[2], 10) : undefined);
    else setField(data.dets[data.strange[0]].f, data.strange[0]);
  });
})();
