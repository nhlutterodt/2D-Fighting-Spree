/**
 * Physics and game mechanics constants
 * Tuned for responsive fighting-game feel
 */

export const PHYSICS = {
  GRAVITY: 2600, // px/s^2
  MAX_RUN: 380, // px/s
  AIR_ACCEL: 2200, // px/s^2 when airborne
  GROUND_ACCEL: 4200, // px/s^2 when grounded
  GROUND_FRICTION: 5200, // px/s^2 decel when no input
  
  JUMP_VEL: 880, // px/s initial jump velocity
  MIN_JUMP_RELEASE: 420, // if released early, clamp upward speed
  COYOTE_TIME: 0.12, // s after leaving ground where jump still allowed
  JUMP_BUFFER: 0.12, // s before landing to buffer a jump
  
  DASH_SPEED: 700, // px/s
  DASH_TIME: 0.12, // s
  DASH_COOLDOWN: 0.35, // s
  
  MAX_JUMPS: 2, // double jump
  WALL_SLIDE_MAX: 180, // clamp downward speed while sliding
  WALL_JUMP_VX: 520,
  WALL_JUMP_VY: 900,
};

export const COMBAT = {
  ATK_START: 0.06, // startup frames
  ATK_ACTIVE: 0.06, // active frames
  ATK_REC: 0.18, // recovery frames
  
  PLAYER_DAMAGE: 8,
  NPC_DAMAGE: 6,
  
  PLAYER_KNOCKBACK_X: 220,
  PLAYER_KNOCKBACK_Y: -180,
  PLAYER_HITSTUN: 0.25,
  PLAYER_INVULN: 0.12,
  
  NPC_KNOCKBACK_X: 200,
  NPC_KNOCKBACK_Y: -140,
  NPC_HITSTUN: 0.20,
  NPC_INVULN: 0.10,
  
  SPARK_DURATION: 0.12,
};

export const CANVAS = {
  WIDTH: 960,
  HEIGHT: 420,
  FLOOR_OFFSET: 60,
};

export const AI = {
  THINK_INTERVAL: {
    Easy: 0.60,
    Normal: 0.40,
    Hard: 0.25,
  },
  ATTACK_CHANCE: 0.15,
  JUMP_CHANCE: 0.25,
  AGGRO_DISTANCE: 180,
};

export const SIMULATION = {
  FIXED_DT: 1 / 120, // 120 Hz simulation
  MAX_FRAME_DT: 0.05, // clamp big gaps
};
