import { readGamepad } from '../../utils/helpers';

const KEY_BINDINGS = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
  jump: [' ', 'Space', 'Spacebar'],
  dash: ['Shift', 'x', 'X'],
  attack: ['z', 'Z', 'j', 'J'],
  confirm: ['Enter', 'e', 'E'],
  back: ['Backspace'],
  pause: ['Escape', 'p', 'P'],
};

function createActionState() {
  return { held: false, pressed: false };
}

function mapKeysToActions(heldKeys, pressedKeys) {
  const actions = {
    left: createActionState(),
    right: createActionState(),
    up: createActionState(),
    down: createActionState(),
    jump: createActionState(),
    dash: createActionState(),
    attack: createActionState(),
    confirm: createActionState(),
    back: createActionState(),
    pause: createActionState(),
  };

  Object.entries(KEY_BINDINGS).forEach(([action, keys]) => {
    actions[action].held = keys.some((k) => heldKeys.has(k));
    actions[action].pressed = keys.some((k) => pressedKeys.has(k));
  });

  return actions;
}

/**
 * Centralizes keyboard + gamepad input into action flags for scenes.
 */
export class InputController {
  constructor() {
    this.heldKeys = new Set();
    this.pressedKeys = new Set();
    this.prevGamepad = { axisX: 0, btnJump: false, btnDash: false, btnAtk: false };
    this.listenersAttached = false;
  }

  attach() {
    if (this.listenersAttached) return;
    this.listenersAttached = true;
    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { passive: false });
  }

  detach() {
    if (!this.listenersAttached) return;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.listenersAttached = false;
  }

  handleKeyDown = (e) => {
    const key = e.key === ' ' ? ' ' : e.key;
    if (this.shouldBlockDefault(key)) {
      e.preventDefault();
    }

    if (!this.heldKeys.has(key)) {
      this.pressedKeys.add(key);
    }
    this.heldKeys.add(key);
  };

  handleKeyUp = (e) => {
    const key = e.key === ' ' ? ' ' : e.key;
    if (this.shouldBlockDefault(key)) {
      e.preventDefault();
    }
    this.heldKeys.delete(key);
    this.pressedKeys.delete(key);
  };

  shouldBlockDefault(key) {
    return (
      key === ' ' ||
      key === 'Space' ||
      key === 'Spacebar' ||
      key.startsWith('Arrow') ||
      key === 'Shift'
    );
  }

  snapshot() {
    const gamepad = readGamepad();
    const { axisX, btnJump, btnDash, btnAtk } = gamepad;

    const actions = mapKeysToActions(this.heldKeys, this.pressedKeys);

    const leftHeld = axisX < -0.25;
    const rightHeld = axisX > 0.25;

    actions.left.held = actions.left.held || leftHeld;
    actions.right.held = actions.right.held || rightHeld;

    const jumpPressed = btnJump && !this.prevGamepad.btnJump;
    const dashPressed = btnDash && !this.prevGamepad.btnDash;
    const atkPressed = btnAtk && !this.prevGamepad.btnAtk;

    actions.jump.held = actions.jump.held || btnJump;
    actions.dash.held = actions.dash.held || btnDash;
    actions.attack.held = actions.attack.held || btnAtk;

    actions.jump.pressed = actions.jump.pressed || jumpPressed;
    actions.dash.pressed = actions.dash.pressed || dashPressed;
    actions.attack.pressed = actions.attack.pressed || atkPressed;

    const snapshot = {
      actions,
      gamepad: {
        ...gamepad,
        leftHeld,
        rightHeld,
        jumpPressed,
        dashPressed,
        atkPressed,
      },
      heldKeys: new Set(this.heldKeys),
    };

    this.prevGamepad = gamepad;
    this.pressedKeys.clear();

    return snapshot;
  }

  /**
   * Non-destructive snapshot for debugging/overlays.
   * Does not clear pressed keys or mutate gamepad state.
   */
  debugSnapshot() {
    const gamepad = readGamepad();
    const { axisX, btnJump, btnDash, btnAtk } = gamepad;

    const actions = mapKeysToActions(this.heldKeys, this.pressedKeys);

    const leftHeld = axisX < -0.25;
    const rightHeld = axisX > 0.25;

    actions.left.held = actions.left.held || leftHeld;
    actions.right.held = actions.right.held || rightHeld;

    actions.jump.held = actions.jump.held || btnJump;
    actions.dash.held = actions.dash.held || btnDash;
    actions.attack.held = actions.attack.held || btnAtk;

    const jumpPressed = btnJump && !this.prevGamepad.btnJump;
    const dashPressed = btnDash && !this.prevGamepad.btnDash;
    const atkPressed = btnAtk && !this.prevGamepad.btnAtk;

    actions.jump.pressed = actions.jump.pressed || jumpPressed;
    actions.dash.pressed = actions.dash.pressed || dashPressed;
    actions.attack.pressed = actions.attack.pressed || atkPressed;
    return {
      actions,
      gamepad: {
        ...gamepad,
        leftHeld,
        rightHeld,
        jumpPressed,
        dashPressed,
        atkPressed,
      },
      heldKeys: new Set(this.heldKeys),
    };
  }
}

export default InputController;
