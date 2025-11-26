/**
 * Helper to define scenes with a consistent, stateful signature.
 *
 * Each scene receives a `sceneCtx` object with:
 * - id: scene identifier
 * - payload: payload provided when the scene was pushed
 * - manager: reference to the SceneManager
 * - state: mutable state object produced by `init`
 * - setState: helper to merge updates into state
 * - initialize: optional hook invoked by the SceneManager before onEnter
 */
export function defineScene({
  id,
  init,
  initialize,
  update,
  render,
  handleInput,
  onEnter,
  onExit,
  metadata,
} = {}) {
  if (!id) throw new Error('defineScene requires an id');

  return ({ payload, manager }) => {
    const state = init?.({ payload, manager }) ?? {};

    const sceneCtx = {
      id,
      payload,
      manager,
      state,
      setState(next) {
        if (typeof next === 'function') {
          const partial = next(state);
          if (partial && typeof partial === 'object') Object.assign(state, partial);
        } else if (next && typeof next === 'object') {
          Object.assign(state, next);
        }
        return state;
      },
    };

    return {
      id,
      metadata,
      initialize: initialize ? (shared) => initialize(sceneCtx, shared) : undefined,
      getState: () => state,
      handleInput: handleInput ? (input, shared) => handleInput(sceneCtx, input, shared) : undefined,
      update: update ? (dt, shared, input) => update(sceneCtx, dt, shared, input) : undefined,
      render: render ? (ctx, shared) => render(sceneCtx, ctx, shared) : undefined,
      onEnter: onEnter ? (shared) => onEnter(sceneCtx, shared) : undefined,
      onExit: onExit ? (shared) => onExit(sceneCtx, shared) : undefined,
    };
  };
}

export default defineScene;
