# COMP2026 portfolio

Served at https://carterdw.github.io/comp2026-portfolio/ (a project site under the academic site's domain).

- `index.html`: hub page
- `solar-system/`, `defects/`, `sky-classifier/`: one sub-site per project
- `assets/portfolio.css`: portfolio components. Base styles come from the academic site's `/assets/style.css`.
- `tools/sync_figures.sh`: copies figures from `~/COMP2026/agentic` into the site. Re-run after regenerating plots.

Before launch: delete the `<meta name="robots" content="noindex">` line on every page.
Workflow: Claude edits and commits; push from VS Code.
