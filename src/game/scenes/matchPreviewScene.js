import { CANVAS } from '../../constants/physics';
import { nowSec } from '../../utils/helpers';
import {
  drawBackground,
  drawFighter,
  drawSpark,
  drawHitboxes,
  drawHUD,
} from '../rendering';
import {
  applyMovement,
  handleJump,
  handleDash,
  handleWallSlide,
  applyGravityAndIntegrate,
  handleFloorCollision,
  clampToBounds,
  updateFacing,
} from '../physics';
import { handleAttack, updateTimers, processCombat } from '../combat';
import { updateAI } from '../ai';
import { defineScene } from '../scene/defineScene';
import { ENTITY_TYPES } from '../entities/baseTypes';

function createFighterState(x, facing, floor) {
  return {
    x,
    y: floor,
    vx: 0,
    vy: 0,
    w: 40,
    h: 80,
    facing,
    color: facing > 0 ? '#a5b4fc' : '#fca5a5',
    hp: 100,
    grounded: true,
    lastGrounded: nowSec(),
    jumpBufferedAt: null,
    jumpsLeft: 2,
    dashing: false,
    dashT: 0,
    dashCD: 0,
    wallSlide: false,
    wallNormal: 0,
    hitstunT: 0,
    invulnT: 0,
    attackT: 0,
    spark: null,
  };
}

export function createMatchPreviewScene({ payload }) {
  const { config, meta, onHUD } = payload;

  return defineScene({
    id: 'match-preview',
    metadata: { stage: meta.stage },
    init: () => ({
      timer: config.timeLimit,
      aiState: { dashCooldown: 0, desired: 0 },
      inputCache: {
        left: false,
        right: false,
        jumpHeld: false,
        dashPressed: false,
        atkPressed: false,
        jumpPressed: false,
      },
      floor: CANVAS.HEIGHT - CANVAS.FLOOR_OFFSET,
      fighterIds: {},
      hitboxes: {},
    }),
    initialize: ({ setState, manager, payload }, { height, log }) => {
      const floor = height - CANVAS.FLOOR_OFFSET;
      const { entities } = manager;
      const p1 = entities.create(
        ENTITY_TYPES.PLAYER,
        createFighterState(200, 1, floor),
        { tags: ['player', 'controllable'], meta: { slot: 'p1' } },
      );
      const p2 = entities.create(
        ENTITY_TYPES.NPC,
        createFighterState(760, -1, floor),
        { tags: ['npc', 'opponent'], meta: { slot: 'p2' } },
      );
      setState({ fighterIds: { p1: p1.id, p2: p2.id }, floor });
      manager.setEnvironment({ floor, stage: meta.stage });
      log('info', 'match preview initialized', { stage: meta.stage, players: payload.meta });
      payload.onHUD?.({ timer: payload.config.timeLimit, p1HP: 100, p2HP: 100 });
    },
    handleInput: ({ state }, input) => {
      const { actions, gamepad } = input;
      state.inputCache.left = actions.left.held || gamepad.leftHeld;
      state.inputCache.right = actions.right.held || gamepad.rightHeld;
      state.inputCache.jumpHeld = actions.jump.held || actions.up.held || gamepad.btnJump;
      state.inputCache.dashPressed = actions.dash.pressed || gamepad.dashPressed;
      state.inputCache.atkPressed = actions.attack.pressed || gamepad.atkPressed;
      state.inputCache.jumpPressed = actions.jump.pressed || actions.up.pressed || gamepad.jumpPressed;
    },
    update: ({ state, payload }, dt, shared) => {
      const { aiState, inputCache } = state;
      const f1 = shared.entities.getState(state.fighterIds.p1);
      const f2 = shared.entities.getState(state.fighterIds.p2);
      const { height, environment } = shared;
      state.floor = environment.floor ?? height - CANVAS.FLOOR_OFFSET;

      const desired = (inputCache.right ? 1 : 0) + (inputCache.left ? -1 : 0);
      const controls = {
        desired,
        left: inputCache.left,
        right: inputCache.right,
        jumpPressed: inputCache.jumpPressed,
        jumpHeld: inputCache.jumpHeld,
      };

      handleDash(f1, inputCache.dashPressed, controls, dt);
      handleAttack(f1, inputCache.atkPressed);
      updateTimers(f1, dt);

      applyMovement(f1, controls, dt);
      handleJump(f1, inputCache.jumpPressed, inputCache.jumpHeld);
      handleWallSlide(f1, controls, inputCache.jumpPressed);
      applyGravityAndIntegrate(f1, dt);
      handleFloorCollision(f1);
      clampToBounds(f1);
      updateFacing(f1, f2);

      updateAI(f2, f1, payload.config.difficulty, dt, aiState);
      updateTimers(f2, dt);
      applyGravityAndIntegrate(f2, dt);
      handleFloorCollision(f2);
      clampToBounds(f2);
      updateFacing(f2, f1);

      state.hitboxes = processCombat(f1, f2);

      if (dt > 0 && state.timer > 0) {
        state.timer = Math.max(0, state.timer - dt);
      }

      payload.onHUD?.({ timer: state.timer, p1HP: f1.hp, p2HP: f2.hp });
    },
    render: ({ state, payload }, ctx, shared) => {
      const { width, height } = shared;
      const f1 = shared.entities.getState(state.fighterIds.p1);
      const f2 = shared.entities.getState(state.fighterIds.p2);
      const { hitboxes } = state;
      drawBackground(ctx, width, height, state.floor);
      drawFighter(ctx, f1);
      drawFighter(ctx, f2);
      drawSpark(ctx, f1.spark);
      drawSpark(ctx, f2.spark);
      drawHitboxes(ctx, hitboxes || {});
      drawHUD(ctx, {
        width,
        p1Name: payload.meta.p1,
        p2Name: payload.meta.p2,
        p1HP: f1.hp,
        p2HP: f2.hp,
        timer: state.timer,
      });
    },
  });
}

export default createMatchPreviewScene;
