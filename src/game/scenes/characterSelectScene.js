import { defineScene } from '../scene/defineScene';
import { ENTITY_TYPES } from '../entities/baseTypes';

const DEFAULT_CONFIG = {
  columns: 3,
  rows: 2,
  bannerHeight: 90,
  allowOpponentSelect: false,
  p1Color: '#a5b4fc',
  p2Color: '#fca5a5',
};

function clampIndex(idx, max) {
  if (idx < 0) return 0;
  if (idx >= max) return max - 1;
  return idx;
}

function moveIndex(idx, columns, total, dir) {
  const row = Math.floor(idx / columns);
  const col = idx % columns;
  let nextRow = row + dir.dy;
  let nextCol = col + dir.dx;
  nextRow = Math.max(0, Math.min(Math.ceil(total / columns) - 1, nextRow));
  nextCol = Math.max(0, Math.min(columns - 1, nextCol));
  let next = nextRow * columns + nextCol;
  if (next >= total) {
    next = total - 1;
  }
  return clampIndex(next, total);
}

export function createCharacterSelectScene({ payload }) {
  const {
    fighters,
    config = {},
    initial = {},
    onSelection,
    onCursor,
  } = payload;

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return defineScene({
    id: 'character-select',
    metadata: { feature: 'character-select' },
    init: () => ({
      roster: fighters,
      config: mergedConfig,
      slots: {
        p1: { cursor: 0, locked: initial.p1 || null },
        p2: {
          cursor: Math.min(1, fighters.length - 1),
          locked: initial.p2 || (mergedConfig.allowOpponentSelect ? null : 'NPC'),
        },
      },
      active: mergedConfig.allowOpponentSelect && !initial.p1 ? 'p1' : 'p2',
      blinkT: 0,
      rosterIds: [],
      badgeIds: [],
    }),
    initialize: ({ state, manager }, { log, height }) => {
      const { entities } = manager;
      const rosterIds = fighters.map((fighter, idx) =>
        entities.create(
          ENTITY_TYPES.ITEM,
          {
            position: { x: idx % mergedConfig.columns, y: Math.floor(idx / mergedConfig.columns) },
            metadata: fighter,
          },
          { tags: ['roster', 'fighter'], meta: { index: idx, fighter } },
        ).id,
      );

      const badgeIds = ['p1', 'p2'].map((slot) =>
        entities.create(
          ENTITY_TYPES.ITEM,
          {
            position: { x: state.slots[slot].cursor, y: 0 },
            metadata: { slot },
          },
          { tags: ['selector', slot], meta: { slot } },
        ).id,
      );

      state.rosterIds = rosterIds;
      state.badgeIds = badgeIds;
      manager.setEnvironment({ layout: 'select', rows: mergedConfig.rows, columns: mergedConfig.columns, height });
      log('info', 'character select initialized', {
        roster: fighters.length,
        config: mergedConfig,
      });
      onCursor?.({
        active: state.active,
        cursor: state.slots[state.active].cursor,
        fighter: fighters[state.slots[state.active].cursor],
      });
    },
    handleInput: ({ state, setState }, input, shared) => {
      const { actions } = input;
      const { roster, config, active, slots } = state;
      const total = roster.length;
      let cursor = slots[active].cursor;
      let didMove = false;

      if (actions.left.pressed || actions.left.held) {
        cursor = moveIndex(cursor, config.columns, total, { dx: -1, dy: 0 });
        didMove = true;
      }
      if (actions.right.pressed || actions.right.held) {
        cursor = moveIndex(cursor, config.columns, total, { dx: 1, dy: 0 });
        didMove = true;
      }
      if (actions.up.pressed || actions.up.held) {
        cursor = moveIndex(cursor, config.columns, total, { dx: 0, dy: -1 });
        didMove = true;
      }
      if (actions.down.pressed || actions.down.held) {
        cursor = moveIndex(cursor, config.columns, total, { dx: 0, dy: 1 });
        didMove = true;
      }

      const nextSlots = { ...slots, [active]: { ...slots[active], cursor } };
      const nextState = { ...state, slots: nextSlots };

      if (didMove) {
        const badgeId = state.badgeIds[active === 'p1' ? 0 : 1];
        shared.entities.update(badgeId, (s) => ({
          position: { ...s.position, x: cursor, y: Math.floor(cursor / config.columns) },
        }));
        onCursor?.({ active, cursor, fighter: roster[cursor] });
      }

      if (actions.confirm.pressed) {
        const fighter = roster[cursor]?.id;
        if (fighter) {
          nextSlots[active].locked = fighter;
          shared.log('info', 'slot locked', { slot: active, fighter });
          onSelection?.({ p1: nextSlots.p1.locked, p2: nextSlots.p2.locked, active });
          if (config.allowOpponentSelect && active === 'p1' && !nextSlots.p2.locked) {
            nextState.active = 'p2';
          }
        }
      }

      if (actions.back.pressed) {
        if (nextSlots[active].locked) {
          nextSlots[active].locked = null;
          shared.log('info', 'slot unlocked', { slot: active });
        } else if (config.allowOpponentSelect && active === 'p2') {
          nextState.active = 'p1';
        }
        onSelection?.({ p1: nextSlots.p1.locked, p2: nextSlots.p2.locked, active });
      }

      setState(nextState);
    },
    update: ({ state }, dt) => {
      state.blinkT += dt * 6;
    },
    render: ({ state }, ctx, shared) => {
      const { width, height } = shared;
      const { roster, config, slots, active, blinkT } = state;
      const padding = 16;
      const cellW = (width - padding * 2) / config.columns;
      const cellH = ((height - padding * 2 - config.bannerHeight) / config.rows) | 0;

      ctx.fillStyle = '#0b1021';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#111827';
      ctx.fillRect(0, height - config.bannerHeight, width, config.bannerHeight);
      ctx.fillStyle = '#c084fc';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('Character Select', padding, height - config.bannerHeight + 28);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Classic versus grid with SF/MK style lock-ins', padding, height - config.bannerHeight + 52);

      roster.forEach((fighter, idx) => {
        const col = idx % config.columns;
        const row = Math.floor(idx / config.columns);
        const x = padding + col * cellW;
        const y = padding + row * cellH;
        const baseColor = '#1f2937';
        const isP1 = slots.p1.cursor === idx;
        const isP2 = slots.p2.cursor === idx;
        const lockedP1 = slots.p1.locked === fighter.id;
        const lockedP2 = slots.p2.locked === fighter.id;

        ctx.fillStyle = baseColor;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 2;
        ctx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);
        ctx.strokeRect(x + 4, y + 4, cellW - 8, cellH - 8);

        if (isP1) {
          ctx.strokeStyle = lockedP1 ? config.p1Color : 'rgba(165,180,252,0.7)';
          ctx.lineWidth = lockedP1 ? 4 : 3;
          ctx.strokeRect(x + 6, y + 6, cellW - 12, cellH - 12);
        }
        if (isP2) {
          ctx.strokeStyle = lockedP2 ? config.p2Color : 'rgba(252,165,165,0.7)';
          ctx.lineWidth = lockedP2 ? 4 : 2;
          ctx.strokeRect(x + 10, y + 10, cellW - 20, cellH - 20);
        }

        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText(fighter.id, x + 14, y + 30);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(fighter.style, x + 14, y + 50);

        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(x + 14, y + cellH - 46, (cellW - 28) * (fighter.speed / 10), 6);
        ctx.fillStyle = '#bfdbfe';
        ctx.fillRect(x + 14, y + cellH - 30, (cellW - 28) * (fighter.power / 10), 6);

        ctx.fillStyle = '#9ca3af';
        ctx.fillText('SPD', x + 14, y + cellH - 50);
        ctx.fillText('PWR', x + 14, y + cellH - 34);

        if (lockedP1 || lockedP2) {
          ctx.fillStyle = lockedP1 ? config.p1Color : config.p2Color;
          ctx.font = '12px Inter, sans-serif';
          ctx.fillText('LOCKED', x + cellW - 80, y + 24);
        }
      });

      const blink = Math.abs(Math.sin(blinkT)) * 0.8 + 0.2;
      const activeSlot = slots[active];
      const fighter = roster[activeSlot.cursor];
      const bannerY = height - config.bannerHeight + 68;
      ctx.fillStyle = active === 'p1' ? config.p1Color : config.p2Color;
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(`${active.toUpperCase()} CURSOR`, padding, bannerY);
      if (fighter) {
        ctx.fillStyle = `rgba(255,255,255,${blink.toFixed(2)})`;
        ctx.font = '24px Inter, sans-serif';
        ctx.fillText(`${fighter.id} — ${fighter.style}`, padding, bannerY + 26);
      }

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Arrows/WASD: move  •  Enter: lock  •  Backspace: undo', width - 380, bannerY);
    },
  });
}

export default createCharacterSelectScene;
