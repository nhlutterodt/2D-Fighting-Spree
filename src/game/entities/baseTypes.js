export const ENTITY_TYPES = {
  PLAYER: 'player',
  NPC: 'npc',
  ITEM: 'item',
};

export function registerBaseEntityTypes(store) {
  store.registerType(ENTITY_TYPES.PLAYER, {
    defaults: {
      hp: 100,
      inventory: [],
      grounded: true,
      vx: 0,
      vy: 0,
    },
    defaultTags: ['character'],
  });

  store.registerType(ENTITY_TYPES.NPC, {
    defaults: {
      hp: 100,
      ai: { state: 'idle' },
      vx: 0,
      vy: 0,
    },
    defaultTags: ['character', 'ai'],
  });

  store.registerType(ENTITY_TYPES.ITEM, {
    defaults: {
      durability: 1,
      owner: null,
      position: { x: 0, y: 0 },
    },
    defaultTags: ['item'],
  });
}

export default ENTITY_TYPES;
