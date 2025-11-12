/**
 * Utility helper functions
 */

/**
 * Clamps a number between min and max values
 * @param {number} n - Number to clamp
 * @param {number} a - Minimum value
 * @param {number} b - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Gets current time in seconds
 * @returns {number} Current time in seconds
 */
export function nowSec() {
  return performance.now() / 1000;
}

/**
 * Simple AABB collision detection
 * @param {Object} a - First box {x, y, w, h}
 * @param {Object} b - Second box {x, y, w, h}
 * @returns {boolean} True if boxes overlap
 */
export function aabb(a, b) {
  return (
    Math.abs(a.x - b.x) * 2 < (a.w + b.w) &&
    Math.abs(a.y - b.y) * 2 < (a.h + b.h)
  );
}

/**
 * Draws a rounded rectangle on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} r - Radius
 */
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Reads gamepad input
 * @returns {Object} Gamepad input state
 */
export function readGamepad() {
  const gp = navigator.getGamepads?.()?.[0];
  let axisX = 0;
  let btnJump = false;
  let btnDash = false;
  let btnAtk = false;
  
  if (gp) {
    axisX = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
    btnJump = !!gp.buttons[0]?.pressed; // A/Cross
    btnDash = !!gp.buttons[1]?.pressed || !!gp.buttons[2]?.pressed; // B/X
    btnAtk = !!gp.buttons[3]?.pressed; // Y/Square
  }
  
  return { axisX, btnJump, btnDash, btnAtk };
}
