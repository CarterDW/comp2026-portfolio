// Gravity golf physics: the same kick-drift-kick leapfrog and event rule as the Python game.
// Written operation for operation like play_export.fly() in the COMP2026 repo, so a shot started from the same
// launch velocity replays to the same bits (checked by play_check.py against 280 reference shots).
"use strict";

const GG = (() => {
  const TIMEOUT = 0, SUNK = 1, CRASH = 2, OUT = 3;
  const NAMES = ["timeout", "sunk", "crash", "out"];

  // One flight. bodies: [[x, y, m, r, star], ...]. Give either (theta, v0) or a stored launch velocity {vx, vy}.
  class Flight {
    constructor(game, hole, theta, v0, vel) {
      const b = hole.bodies;
      this.b = b;
      this.dt = game.dt;
      this.box = game.box;
      this.rh = game.r_hole;
      this.n = Math.round(game.t_max / game.dt);
      this.hx = hole.hole[0];
      this.hy = hole.hole[1];
      this.x = game.tee[0];
      this.y = game.tee[1];
      if (vel) { this.vx = vel.vx; this.vy = vel.vy; }
      else { this.vx = v0 * Math.cos(theta); this.vy = v0 * Math.sin(theta); }
      let ax = 0.0, ay = 0.0;
      this.rmin = new Array(b.length);
      for (let k = 0; k < b.length; k++) {
        const dx = b[k][0] - this.x, dy = b[k][1] - this.y;
        const r2 = dx * dx + dy * dy;
        const rr = Math.sqrt(r2);
        const f = b[k][2] / (r2 * rr);
        ax += f * dx; ay += f * dy;
        this.rmin[k] = rr;
      }
      this.ax = ax; this.ay = ay;
      this.dmin = Math.sqrt((this.x - this.hx) * (this.x - this.hx) + (this.y - this.hy) * (this.y - this.hy));
      this.s = 0;
      this.outcome = null;
      this.t = 0;
    }

    // Advance up to `steps` leapfrog steps; stops at the first event. Returns true while still flying.
    step(steps) {
      const b = this.b, dt = this.dt;
      let { x, y, vx, vy, ax, ay } = this;
      for (let i = 0; i < steps && this.outcome === null; i++) {
        this.s += 1;
        vx += 0.5 * dt * ax; vy += 0.5 * dt * ay;
        x += dt * vx; y += dt * vy;
        ax = 0.0; ay = 0.0;
        let crash = false;
        for (let k = 0; k < b.length; k++) {
          const dx = b[k][0] - x, dy = b[k][1] - y;
          const r2 = dx * dx + dy * dy;
          const rr = Math.sqrt(r2);
          const f = b[k][2] / (r2 * rr);
          ax += f * dx; ay += f * dy;
          if (rr < this.rmin[k]) this.rmin[k] = rr;
          if (rr < b[k][3]) crash = true;
        }
        vx += 0.5 * dt * ax; vy += 0.5 * dt * ay;
        const dh = Math.sqrt((x - this.hx) * (x - this.hx) + (y - this.hy) * (y - this.hy));
        if (dh < this.dmin) this.dmin = dh;
        if (crash) this.outcome = CRASH;
        else if (dh < this.rh) this.outcome = SUNK;
        else if (Math.max(Math.abs(x), Math.abs(y)) > this.box) this.outcome = OUT;
        else if (this.s >= this.n) this.outcome = TIMEOUT;
      }
      Object.assign(this, { x, y, vx, vy, ax, ay });
      this.t = this.s * dt;
      return this.outcome === null;
    }

    starsTouched(touch) {
      let n = 0;
      for (let k = 0; k < this.b.length; k++) if (this.b[k][4] && this.rmin[k] < touch * this.b[k][3]) n++;
      return n;
    }
  }

  function fly(game, hole, theta, v0, vel) {
    const f = new Flight(game, hole, theta, v0, vel);
    f.step(f.n);
    return f;
  }

  return { Flight, fly, NAMES, TIMEOUT, SUNK, CRASH, OUT };
})();
if (typeof module !== "undefined") module.exports = GG;
