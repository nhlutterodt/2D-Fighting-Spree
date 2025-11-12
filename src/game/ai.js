import { AI, PHYSICS, COMBAT } from '../constants/physics';

/**
 * AI logic for NPC fighters
 */

/**
 * Updates NPC AI behavior
 * @param {Object} npc - NPC fighter object
 * @param {Object} player - Player fighter object
 * @param {string} difficulty - AI difficulty level
 * @param {number} dt - Delta time
 * @param {Object} aiState - AI state object with timer
 */
export function updateAI(npc, player, difficulty, dt, aiState) {
  // Skip AI during hitstun
  if (npc.hitstunT > 0) {
    npc.hitstunT -= dt;
    return;
  }
  
  aiState.timer += dt;
  const thinkInterval = AI.THINK_INTERVAL[difficulty] || AI.THINK_INTERVAL.Normal;
  
  if (aiState.timer >= thinkInterval) {
    aiState.timer = 0;
    
    const dist = npc.x - player.x;
    const far = Math.abs(dist) > AI.AGGRO_DISTANCE;
    const dir = Math.sign(dist);
    
    if (far) {
      // Move toward player
      const target = -dir * PHYSICS.MAX_RUN * 0.75;
      const delta = target - npc.vx;
      const maxDelta = (npc.grounded ? PHYSICS.GROUND_ACCEL : PHYSICS.AIR_ACCEL) * thinkInterval;
      npc.vx += Math.sign(delta) * Math.min(Math.abs(delta), maxDelta);
    } else {
      // Random movement when close
      npc.vx += (Math.random() - 0.5) * 120 * dt;
      
      // Random jump
      if (Math.random() < AI.JUMP_CHANCE && npc.grounded) {
        npc.vy = -PHYSICS.JUMP_VEL * 0.9;
      }
    }
    
    // Random attack
    if (Math.random() < AI.ATTACK_CHANCE && npc.attackT <= 0) {
      npc.attackT = COMBAT.ATK_START + COMBAT.ATK_ACTIVE + COMBAT.ATK_REC;
    }
  }
}
