import { roundRect } from '../utils/helpers';

/**
 * Rendering utilities for the game canvas
 */

/**
 * Draws a fighter character on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} fighter - Fighter body object
 */
export function drawFighter(ctx, fighter) {
  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath();
  ctx.ellipse(0, 40, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.fillStyle = fighter.color;
  roundRect(ctx, -fighter.w / 2, -fighter.h, fighter.w, fighter.h, 10);
  ctx.fill();
  
  // Head
  ctx.beginPath();
  ctx.arc(0, -fighter.h - 18, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // Facing indicator
  ctx.fillStyle = "#fff";
  ctx.fillRect(
    (fighter.facing > 0 ? 8 : -12), 
    -fighter.h + 10, 
    4, 
    14
  );
  
  ctx.restore();
}

/**
 * Draws a hit spark effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} spark - Spark object with x, y, t properties
 */
export function drawSpark(ctx, spark) {
  if (!spark) return;
  
  ctx.save();
  ctx.translate(spark.x, spark.y);
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.globalAlpha = Math.max(0, spark.t / 0.12);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the background
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} floor - Floor Y position
 */
export function drawBackground(ctx, width, height, floor) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e293b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  
  // Floor shadow
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, floor + 40, width, height - floor - 40);
  
  // Floor line
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, floor, width, 4);
}

/**
 * Draws hitboxes for debugging
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} hitboxes - Object containing attack and hurt boxes
 */
export function drawHitboxes(ctx, hitboxes) {
  ctx.save();
  
  if (hitboxes.atk1) {
    ctx.strokeStyle = "#22c55e";
    ctx.strokeRect(
      hitboxes.atk1.x - hitboxes.atk1.w / 2,
      hitboxes.atk1.y - hitboxes.atk1.h / 2,
      hitboxes.atk1.w,
      hitboxes.atk1.h
    );
  }
  
  if (hitboxes.atk2) {
    ctx.strokeStyle = "#ef4444";
    ctx.strokeRect(
      hitboxes.atk2.x - hitboxes.atk2.w / 2,
      hitboxes.atk2.y - hitboxes.atk2.h / 2,
      hitboxes.atk2.w,
      hitboxes.atk2.h
    );
  }
  
  if (hitboxes.hurt1) {
    ctx.strokeStyle = "#60a5fa";
    ctx.strokeRect(
      hitboxes.hurt1.x - hitboxes.hurt1.w / 2,
      hitboxes.hurt1.y - hitboxes.hurt1.h / 2,
      hitboxes.hurt1.w,
      hitboxes.hurt1.h
    );
  }
  
  if (hitboxes.hurt2) {
    ctx.strokeStyle = "#f472b6";
    ctx.strokeRect(
      hitboxes.hurt2.x - hitboxes.hurt2.w / 2,
      hitboxes.hurt2.y - hitboxes.hurt2.h / 2,
      hitboxes.hurt2.w,
      hitboxes.hurt2.h
    );
  }
  
  ctx.restore();
}

/**
 * Draws the HUD (health bars and timer)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} params - HUD parameters
 */
export function drawHUD(ctx, { width, p1Name, p2Name, p1HP, p2HP, timer }) {
  ctx.save();
  
  // Player 1 health bar
  ctx.fillStyle = "#111827";
  ctx.fillRect(20, 20, 360, 16);
  ctx.fillStyle = "#a5b4fc";
  ctx.fillRect(20, 20, 360 * Math.max(0, p1HP / 100), 16);
  
  // Player 2 health bar
  ctx.fillStyle = "#111827";
  ctx.fillRect(width - 380, 20, 360, 16);
  ctx.fillStyle = "#fca5a5";
  const p2BarWidth = 360 * Math.max(0, p2HP / 100);
  ctx.fillRect(width - 380 + (360 - p2BarWidth), 20, p2BarWidth, 16);
  
  // Text labels
  ctx.fillStyle = "#fff";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${p1Name} ${Math.max(0, Math.round(p1HP))} HP`, 24, 32);
  
  ctx.textAlign = "right";
  ctx.fillText(`${p2Name} ${Math.max(0, Math.round(p2HP))} HP`, width - 24, 32);
  
  // Timer
  ctx.textAlign = "center";
  ctx.font = "bold 20px ui-sans-serif, system-ui";
  ctx.fillText(String(Math.max(0, Math.round(timer))), width / 2, 36);
  
  ctx.restore();
}
