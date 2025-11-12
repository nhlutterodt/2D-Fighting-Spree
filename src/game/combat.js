import { COMBAT } from '../constants/physics';
import { aabb } from '../utils/helpers';

/**
 * Combat and attack logic
 */

/**
 * Handles attack initiation
 * @param {Object} fighter - Fighter body object
 * @param {boolean} attackPressed - Whether attack was just pressed
 */
export function handleAttack(fighter, attackPressed) {
  if (attackPressed && fighter.attackT <= 0 && fighter.hitstunT <= 0) {
    fighter.attackT = COMBAT.ATK_START + COMBAT.ATK_ACTIVE + COMBAT.ATK_REC;
  }
}

/**
 * Updates attack and status timers
 * @param {Object} fighter - Fighter body object
 * @param {number} dt - Delta time
 */
export function updateTimers(fighter, dt) {
  if (fighter.attackT > 0) fighter.attackT -= dt;
  if (fighter.hitstunT > 0) fighter.hitstunT -= dt;
  if (fighter.invulnT > 0) fighter.invulnT -= dt;
  if (fighter.spark) {
    fighter.spark.t -= dt;
    if (fighter.spark.t <= 0) fighter.spark = null;
  }
}

/**
 * Creates hitbox for active attack
 * @param {Object} fighter - Fighter body object
 * @returns {Object|null} Hitbox or null if not attacking
 */
export function getAttackHitbox(fighter) {
  const isActive = fighter.attackT > COMBAT.ATK_REC && 
                   fighter.attackT <= (COMBAT.ATK_ACTIVE + COMBAT.ATK_REC);
  
  if (!isActive) return null;
  
  return {
    x: fighter.x + fighter.facing * (fighter.w / 2 + 18),
    y: fighter.y - fighter.h * 0.65,
    w: 32,
    h: 22
  };
}

/**
 * Creates hurtbox for fighter
 * @param {Object} fighter - Fighter body object
 * @returns {Object} Hurtbox
 */
export function getHurtbox(fighter) {
  return {
    x: fighter.x,
    y: fighter.y - fighter.h / 2,
    w: fighter.w,
    h: fighter.h
  };
}

/**
 * Processes combat between two fighters
 * @param {Object} f1 - Fighter 1
 * @param {Object} f2 - Fighter 2
 * @returns {Object} Hitbox data for rendering
 */
export function processCombat(f1, f2) {
  const atk1 = getAttackHitbox(f1);
  const atk2 = getAttackHitbox(f2);
  const hurt1 = getHurtbox(f1);
  const hurt2 = getHurtbox(f2);
  
  // Player 1 hits Player 2
  if (atk1 && aabb(atk1, hurt2) && f2.invulnT <= 0) {
    f2.hp = Math.max(0, f2.hp - COMBAT.PLAYER_DAMAGE);
    f2.vx = COMBAT.PLAYER_KNOCKBACK_X * f1.facing;
    f2.vy = COMBAT.PLAYER_KNOCKBACK_Y;
    f2.hitstunT = COMBAT.PLAYER_HITSTUN;
    f2.invulnT = COMBAT.PLAYER_INVULN;
    f1.spark = {
      x: (atk1.x + hurt2.x) / 2,
      y: (atk1.y + hurt2.y) / 2,
      t: COMBAT.SPARK_DURATION
    };
  }
  
  // Player 2 hits Player 1
  if (atk2 && aabb(atk2, hurt1) && f1.invulnT <= 0) {
    f1.hp = Math.max(0, f1.hp - COMBAT.NPC_DAMAGE);
    f1.vx = COMBAT.NPC_KNOCKBACK_X * f2.facing;
    f1.vy = COMBAT.NPC_KNOCKBACK_Y;
    f1.hitstunT = COMBAT.NPC_HITSTUN;
    f1.invulnT = COMBAT.NPC_INVULN;
    f2.spark = {
      x: (atk2.x + hurt1.x) / 2,
      y: (atk2.y + hurt1.y) / 2,
      t: COMBAT.SPARK_DURATION
    };
  }
  
  return { atk1, atk2, hurt1, hurt2 };
}
