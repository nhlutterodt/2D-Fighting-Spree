const randomId = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `ent-${Math.random().toString(16).slice(2)}`);

/**
 * EntityStore tracks game entities (players, NPCs, items) with
 * type definitions, tags, metadata, and lifecycle helpers.
 */
export class EntityStore {
  constructor({ logLevel = 'warn', logger = console } = {}) {
    this.registry = new Map();
    this.entities = new Map();
    this.logger = logger;
    this.logLevel = logLevel;
    this.logLevels = { debug: 10, info: 20, warn: 30, error: 40, none: 50 };
    this.seq = 0;
  }

  shouldLog(level) {
    const configured = this.logLevels[this.logLevel] ?? this.logLevels.info;
    const incoming = this.logLevels[level] ?? this.logLevels.info;
    return incoming >= configured && configured < this.logLevels.none;
  }

  log(level, message, meta) {
    if (!this.shouldLog(level)) return;
    const impl = this.logger?.[level] ?? this.logger?.log ?? console.log;
    impl?.call(this.logger, `[EntityStore] ${message}`, meta);
  }

  registerType(type, { defaults = {}, validator, factory, onRemove, defaultTags = [] } = {}) {
    if (!type) throw new Error('registerType requires a type');
    this.registry.set(type, { defaults, validator, factory, onRemove, defaultTags });
    this.log('info', 'type registered', { type });
  }

  nextId(type) {
    this.seq += 1;
    return `${type}-${this.seq}`;
  }

  create(type, state = {}, { tags = [], meta = {}, id } = {}) {
    const spec = this.registry.get(type);
    if (!spec) throw new Error(`Unknown entity type: ${type}`);

    const factoryState = typeof spec.factory === 'function' ? spec.factory(state, meta) : {};
    const mergedState = { ...spec.defaults, ...factoryState, ...state };
    if (spec.validator) spec.validator(mergedState);

    const entityId = id || this.nextId(type) || randomId();
    const entity = {
      id: entityId,
      type,
      state: mergedState,
      tags: new Set([...(spec.defaultTags ?? []), ...tags]),
      meta: { ...meta },
    };

    this.entities.set(entityId, entity);
    this.log('info', 'entity created', { id: entityId, type, tags: [...entity.tags] });
    return entity;
  }

  get(id) {
    return this.entities.get(id) || null;
  }

  require(id) {
    const entity = this.get(id);
    if (!entity) throw new Error(`Missing entity: ${id}`);
    return entity;
  }

  getState(id) {
    return this.require(id).state;
  }

  update(id, patchOrFn) {
    const entity = this.require(id);
    if (typeof patchOrFn === 'function') {
      const partial = patchOrFn(entity.state, entity);
      if (partial && typeof partial === 'object') {
        Object.assign(entity.state, partial);
      }
    } else if (patchOrFn && typeof patchOrFn === 'object') {
      Object.assign(entity.state, patchOrFn);
    }
    this.log('debug', 'entity updated', { id, type: entity.type });
    return entity.state;
  }

  assignTags(id, nextTags = []) {
    const entity = this.require(id);
    nextTags.forEach((tag) => entity.tags.add(tag));
    return entity;
  }

  clearTags(id, tagsToRemove = []) {
    const entity = this.require(id);
    tagsToRemove.forEach((tag) => entity.tags.delete(tag));
    return entity;
  }

  remove(id) {
    const entity = this.entities.get(id);
    if (!entity) return false;
    const spec = this.registry.get(entity.type);
    if (spec?.onRemove) spec.onRemove(entity);
    const deleted = this.entities.delete(id);
    this.log('info', 'entity removed', { id, type: entity.type });
    return deleted;
  }

  clear(type) {
    if (!type) {
      this.entities.clear();
      return;
    }
    for (const [id, entity] of this.entities.entries()) {
      if (entity.type === type) {
        this.remove(id);
      }
    }
  }

  findByType(type) {
    return [...this.entities.values()].filter((entity) => entity.type === type);
  }

  findByTag(tag) {
    return [...this.entities.values()].filter((entity) => entity.tags.has(tag));
  }

  find(predicate) {
    return [...this.entities.values()].filter((entity) => predicate(entity));
  }

  snapshot() {
    return [...this.entities.values()].map((entity) => ({
      id: entity.id,
      type: entity.type,
      state: { ...entity.state },
      tags: [...entity.tags],
      meta: { ...entity.meta },
    }));
  }

  hydrate(records = []) {
    this.entities.clear();
    records.forEach((record) => {
      const { id = randomId(), type, state = {}, tags = [], meta = {} } = record;
      const spec = this.registry.get(type) ?? { defaults: {} };
      const mergedState = { ...spec.defaults, ...state };
      const entity = { id, type, state: mergedState, tags: new Set(tags), meta: { ...meta } };
      this.entities.set(id, entity);
    });
    this.log('info', 'store hydrated', { count: this.entities.size });
  }
}

export default EntityStore;
