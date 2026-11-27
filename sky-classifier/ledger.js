// The ledger: every ingredient of the simulated sky as a clickable card (data: ledger/ledger.json).
"use strict";

(() => {
  const grid = document.getElementById("ledger-grid"), panel = document.getElementById("ledger-detail");
  if (!grid) return;
  fetch("ledger/ledger.json").then((r) => r.json()).then((L) => {
    const cards = [];
    L.ingredients.forEach((ing, k) => {
      const b = document.createElement("button");
      b.className = "lcard";
      b.innerHTML = (ing.img ? `<img src="ledger/${ing.img}" alt="">` : `<div class="noimg">final arc</div>`) +
        `<div class="ln">${ing.rung === null ? "+" : ing.rung}</div><div class="lt">${ing.name}</div>` +
        (ing.acc ? `<div class="la">${ing.acc[0].toFixed(1)}% real stars</div>` : `<div class="la">&nbsp;</div>`);
      b.addEventListener("click", () => show(k));
      grid.appendChild(b);
      cards.push(b);
    });

    function show(k) {
      const ing = L.ingredients[k];
      cards.forEach((c, i) => c.classList.toggle("on", i === k));
      let h = `<div class="ld-top">`;
      if (ing.img) h += `<figure><img src="ledger/${ing.img}" alt="simulated star at rung ${ing.rung}"><figcaption>simulated, rung ${ing.rung}</figcaption></figure>` +
        `<figure><img src="ledger/${L.real.img}" alt="real SDSS star"><figcaption>real SDSS star, r = ${L.real.r}</figcaption></figure>`;
      h += `<div><h3>${ing.name}</h3><p>${ing.why}</p>`;
      if (ing.acc) h += `<p><b>Real-star accuracy ${ing.rung === null ? "now" : "at this rung"}: ${ing.acc[0].toFixed(1)}%</b>` +
        (ing.acc[1] !== null ? ` (± ${ing.acc[1].toFixed(1)} over 10 seeds)` : "") + `</p>`;
      h += `</div></div>`;
      if (ing.removal) {
        const R = ing.removal;
        h += `<p class="lr">Remove it from the full model (10 seeds each): change in accuracy, in points. Bold cells pass the ${L.bar}-point bar.</p>` +
          `<table class="lrt"><tr>${R.cols.map((c) => `<th>${c}</th>`).join("")}</tr><tr>` +
          R.shift.map(([v, f]) => `<td class="${f ? "beyond" : ""} ${v < 0 ? "neg" : "pos"}">${v > 0 ? "+" : ""}${v.toFixed(1)}</td>`).join("") +
          `</tr></table>` + (R.verdict ? `<p class="lr">Verdict: ${R.verdict}.</p>` : "");
      } else if (ing.rung === 0) {
        h += `<p class="lr">The base of every model, so it has no removal test.</p>`;
      } else {
        h += `<p class="lr">Added after the removal test; see the sections below.</p>`;
      }
      panel.innerHTML = h;
      panel.hidden = false;
    }
    show(2);
  });
})();
