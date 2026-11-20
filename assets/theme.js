// Light/dark toggle shared by every portfolio page (same behaviour as the academic site).
(function () {
  try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  document.addEventListener("DOMContentLoaded", () => {
    const b = document.getElementById("theme-toggle");
    if (!b) return;
    b.addEventListener("click", () => {
      const root = document.documentElement;
      const dark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    });
  });
})();
