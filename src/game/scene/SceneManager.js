import { SIMULATION, CANVAS } from '../../constants/physics';
import { EntityStore } from '../entities/EntityStore';
import { registerBaseEntityTypes } from '../entities/baseTypes';
import { InputController } from './InputController';

/**
 * Runtime responsible for driving a stack of canvas scenes with shared input and timing.
 */
export class SceneManager {
  constructor({
    canvas,
    width = CANVAS.WIDTH,
    height = CANVAS.HEIGHT,
    fixedDt = SIMULATION.FIXED_DT,
    maxFrameDt = SIMULATION.MAX_FRAME_DT,
    logLevel = 'warn',
    logger = console,
  } = {}) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext?.('2d') ?? null;
    this.canvas.width = width;
    this.canvas.height = height;

    this.fixedDt = fixedDt;
    this.maxFrameDt = maxFrameDt;

    this.registry = new Map();
    this.stack = [];
    this.environment = { floor: height - CANVAS.FLOOR_OFFSET };
    this.stackSnapshot = [];
    this.stackDirty = true;

    this.entities = new EntityStore({ logger, logLevel });
    registerBaseEntityTypes(this.entities);

    this.input = new InputController();
    this.running = false;
    this.paused = false;
    this.prevMs = 0;
    this.accumulator = 0;
    this.logger = logger;
    this.logLevel = logLevel;
    this.logLevels = { debug: 10, info: 20, warn: 30, error: 40, none: 50 };
    this.sharedContext = null;
  }

  register(id, factory) {
    this.registry.set(id, factory);
  }

  start(initialId, payload) {
    this.stop();
    this.input.attach();
    this.running = true;
    this.prevMs = performance.now();
    this.accumulator = 0;
    this.stack = [];
    this.stackSnapshot = [];
    this.stackDirty = true;
    this.entities.clear();
    if (initialId) {
      this.push(initialId, payload);
    }
    this.loopId = requestAnimationFrame(this.frame);
  }

  stop() {
    if (this.loopId) cancelAnimationFrame(this.loopId);
    this.loopId = null;
    this.running = false;
    this.input.detach();
    this.entities.clear();
    this.stackDirty = true;
    while (this.stack.length) {
      const scene = this.stack.pop();
      scene?.onExit?.(this.shared());
    }
  }

  push(id, payload) {
    const factory = this.registry.get(id);
    if (!factory) throw new Error(`Unknown scene id: ${id}`);
    const scene = factory({ payload, manager: this });
    scene.initialized = !scene.initialize;
    this.stack.push(scene);
    this.stackDirty = true;
    this.log('info', 'scene push', { id, stack: this.getStackSnapshot() });
    this.prepareScene(scene);
    return scene;
  }

  replace(id, payload) {
    const top = this.stack.pop();
    top?.onExit?.(this.shared());
    this.stackDirty = true;
    this.log('info', 'scene replace', { id, stack: this.getStackSnapshot() });
    return this.push(id, payload);
  }

  pop() {
    const scene = this.stack.pop();
    this.stackDirty = true;
    this.log('info', 'scene pop', { id: scene?.id, stack: this.getStackSnapshot() });
    scene?.onExit?.(this.shared());
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  removeById(id) {
    const idx = this.stack.findLastIndex((scene) => scene?.id === id);
    if (idx === -1) return;
    const [scene] = this.stack.splice(idx, 1);
    this.stackDirty = true;
    this.log('info', 'scene remove', { id, stack: this.getStackSnapshot() });
    scene?.onExit?.(this.shared());
  }

  setPaused(next) {
    this.paused = next;
  }

  setEnvironment(nextEnv) {
    this.environment = { ...this.environment, ...nextEnv };
  }

  shouldLog(level) {
    const configured = this.logLevels[this.logLevel] ?? this.logLevels.info;
    const incoming = this.logLevels[level] ?? this.logLevels.info;
    return incoming >= configured && configured < this.logLevels.none;
  }

  log(level, message, meta) {
    if (!this.shouldLog(level)) return;
    const impl = this.logger?.[level] ?? this.logger?.log ?? console.log;
    impl?.call(this.logger, `[SceneManager] ${message}`, meta);
  }

  async prepareScene(scene) {
    const shared = this.shared();
    const runEnter = () => {
      scene.initialized = true;
      scene.initializing = null;
      scene?.onEnter?.(this.shared());
    };

    if (!scene?.initialize) {
      runEnter();
      return;
    }

    try {
      const result = scene.initialize(shared);
      if (result instanceof Promise) {
        scene.initializing = result
          .then(() => {
            this.log('info', 'scene initialized (async)', { id: scene.id, stack: this.getStackSnapshot() });
            runEnter();
          })
          .catch((err) => {
            this.log('error', 'scene initialize failed', { id: scene.id, error: err?.message });
            runEnter();
          });
      } else {
        this.log('info', 'scene initialized', { id: scene.id, stack: this.getStackSnapshot() });
        runEnter();
      }
    } catch (err) {
      this.log('error', 'scene initialize threw', { id: scene.id, error: err?.message });
      runEnter();
    }
  }

  getStackSnapshot() {
    return this.refreshStackSnapshot();
  }

  refreshStackSnapshot() {
    if (!this.stackDirty) return this.stackSnapshot;
    this.stackSnapshot = this.stack.map((scene, idx) => ({
      index: idx,
      id: scene?.id,
      metadata: scene?.metadata ?? null,
    }));
    this.stackDirty = false;
    return this.stackSnapshot;
  }

  frame = (ts) => {
    if (!this.running) return;

    const dt = Math.min(this.maxFrameDt, (ts - this.prevMs) / 1000);
    this.prevMs = ts;
    this.accumulator += dt;

    const shared = this.shared();
    const input = this.input.snapshot();

    if (!this.paused) {
      while (this.accumulator >= this.fixedDt) {
        this.update(this.fixedDt, shared, input);
        this.accumulator -= this.fixedDt;
      }
    } else {
      this.update(0, shared, input);
    }

    this.render(shared);
    this.loopId = requestAnimationFrame(this.frame);
  };

  update(dt, shared, input) {
    const topIdx = this.stack.length - 1;
    if (topIdx >= 0) {
      const top = this.stack[topIdx];
      if (top?.initialized) {
        top.handleInput?.(input, shared);
      }
    }
    for (const scene of this.stack) {
      if (!scene?.initialized) continue;
      scene.update?.(dt, shared, input);
    }
  }

  render(shared) {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const scene of this.stack) {
      if (!scene?.initialized) continue;
      scene.render?.(ctx, shared);
    }
    ctx.restore();
  }

  shared() {
    if (!this.sharedContext) {
      this.sharedContext = {
        canvas: this.canvas,
        ctx: this.ctx,
        manager: this,
        input: this.input,
        entities: this.entities,
        log: (level, message, meta) => this.log(level, message, meta),
      };
    }

    this.refreshStackSnapshot();
    this.sharedContext.width = this.canvas.width;
    this.sharedContext.height = this.canvas.height;
    this.sharedContext.environment = this.environment;
    this.sharedContext.stack = this.stackSnapshot;

    return this.sharedContext;
  }
}

export default SceneManager;
