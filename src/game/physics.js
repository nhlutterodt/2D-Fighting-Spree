import { PHYSICS, CANVAS } from '../constants/physics';
import { clamp, nowSec } from '../utils/helpers';

/**
 * Physics and movement logic for fighters
 */

/**
 * Applies movement physics to a fighter
 * @param {Object} fighter - Fighter body object
 * @param {Object} input - Input state
 * @param {number} dt - Delta time
 */
export function applyMovement(fighter, input, dt) {
  const { desired } = input;
  
  // Skip movement if dashing or in heavy hitstun
  if (fighter.dashing || fighter.hitstunT > 0) {
    return;
  }
  
  const accel = fighter.grounded ? PHYSICS.GROUND_ACCEL : PHYSICS.AIR_ACCEL;
  const target = desired * PHYSICS.MAX_RUN;
  const delta = target - fighter.vx;
  const maxDelta = accel * dt;
  
  if (Math.abs(delta) <= maxDelta) {
    fighter.vx = target;
  } else {
    fighter.vx += Math.sign(delta) * maxDelta;
  }
  
  // Ground friction when no input
  if (desired === 0 && fighter.grounded) {
    const sign = Math.sign(fighter.vx);
    const mag = Math.max(0, Math.abs(fighter.vx) - PHYSICS.GROUND_FRICTION * dt);
    fighter.vx = mag * sign;
  }
}

/**
 * Handles jump logic including coyote time and buffering
 * @param {Object} fighter - Fighter body object
 * @param {boolean} jumpPressed - Whether jump was just pressed
 * @param {boolean} jumpHeld - Whether jump is held
 */
export function handleJump(fighter, jumpPressed, jumpHeld) {
  const tNow = nowSec();
  const canGroundJump = (tNow - fighter.lastGrounded) <= PHYSICS.COYOTE_TIME;
  const buffered = fighter.jumpBufferedAt && (tNow - fighter.jumpBufferedAt) <= PHYSICS.JUMP_BUFFER;
  
  const performJump = (force = false) => {
    fighter.vy = -PHYSICS.JUMP_VEL;
    fighter.grounded = false;
    fighter.jumpBufferedAt = null;
    if (!force) {
      fighter.jumpsLeft = Math.max(0, fighter.jumpsLeft - 1);
    }
  };
  
  // Ground jump (with coyote time and buffer)
  if (canGroundJump && (buffered || jumpPressed) && fighter.jumpsLeft === PHYSICS.MAX_JUMPS) {
    performJump();
  }
  // Air jump (double jump)
  else if (jumpPressed && fighter.jumpsLeft > 0 && !fighter.grounded && !fighter.wallSlide) {
    performJump();
  }
  
  // Variable jump height - release jump early for short hop
  if (!jumpHeld && fighter.vy < -PHYSICS.MIN_JUMP_RELEASE) {
    fighter.vy = -PHYSICS.MIN_JUMP_RELEASE;
  }
}

/**
 * Handles dash mechanics
 * @param {Object} fighter - Fighter body object
 * @param {boolean} dashPressed - Whether dash was just pressed
 * @param {Object} input - Input state with left/right
 * @param {number} dt - Delta time
 */
export function handleDash(fighter, dashPressed, input, dt) {
  // Update cooldowns
  if (fighter.dashCD > 0) fighter.dashCD -= dt;
  if (fighter.dashing) {
    fighter.dashT -= dt;
    if (fighter.dashT <= 0) fighter.dashing = false;
  }
  
  // Initiate dash
  if (dashPressed && fighter.dashCD <= 0 && !fighter.dashing && fighter.hitstunT <= 0) {
    fighter.dashing = true;
    fighter.dashT = PHYSICS.DASH_TIME;
    fighter.dashCD = PHYSICS.DASH_COOLDOWN;
    
    const dir = input.right ? 1 : input.left ? -1 : fighter.facing;
    fighter.vx = dir * PHYSICS.DASH_SPEED;
    fighter.vy = 0;
  }
}

/**
 * Handles wall slide and wall jump mechanics
 * @param {Object} fighter - Fighter body object
 * @param {Object} input - Input state
 * @param {boolean} jumpPressed - Whether jump was just pressed
 */
export function handleWallSlide(fighter, input, jumpPressed) {
  const nearLeft = fighter.x <= 40;
  const nearRight = fighter.x >= CANVAS.WIDTH - 40;
  const holdingLeft = input.left;
  const holdingRight = input.right;
  
  fighter.wallSlide = false;
  fighter.wallNormal = 0;
  
  if (!fighter.grounded && ((nearLeft && holdingLeft) || (nearRight && holdingRight))) {
    fighter.wallSlide = true;
    fighter.wallNormal = nearLeft ? 1 : -1;
    
    // Clamp fall speed
    if (fighter.vy > PHYSICS.WALL_SLIDE_MAX) {
      fighter.vy = PHYSICS.WALL_SLIDE_MAX;
    }
    
    // Wall jump
    if (jumpPressed) {
      fighter.vx = PHYSICS.WALL_JUMP_VX * fighter.wallNormal;
      fighter.vy = -PHYSICS.WALL_JUMP_VY;
      fighter.facing = fighter.wallNormal;
      fighter.wallSlide = false;
      fighter.wallNormal = 0;
      fighter.jumpsLeft = PHYSICS.MAX_JUMPS - 1;
    }
  }
}

/**
 * Applies gravity and integrates position
 * @param {Object} fighter - Fighter body object
 * @param {number} dt - Delta time
 */
export function applyGravityAndIntegrate(fighter, dt) {
  fighter.vy += PHYSICS.GRAVITY * dt;
  fighter.x += fighter.vx * dt;
  fighter.y += fighter.vy * dt;
}

/**
 * Handles floor collision
 * @param {Object} fighter - Fighter body object
 */
export function handleFloorCollision(fighter) {
  const floor = CANVAS.HEIGHT - CANVAS.FLOOR_OFFSET;
  
  if (fighter.y >= floor) {
    fighter.y = floor;
    fighter.vy = 0;
    
    if (!fighter.grounded) {
      fighter.lastGrounded = nowSec();
    }
    
    fighter.grounded = true;
    fighter.jumpsLeft = PHYSICS.MAX_JUMPS;
  } else {
    fighter.grounded = false;
  }
}

/**
 * Clamps fighter position to canvas bounds
 * @param {Object} fighter - Fighter body object
 */
export function clampToBounds(fighter) {
  fighter.x = clamp(fighter.x, 40, CANVAS.WIDTH - 40);
}

/**
 * Updates fighter facing direction
 * @param {Object} fighter - Fighter body object
 * @param {Object} opponent - Opponent body object
 */
export function updateFacing(fighter, opponent) {
  if (fighter.hitstunT <= 0) {
    fighter.facing = (opponent.x > fighter.x) ? 1 : -1;
  }
}
