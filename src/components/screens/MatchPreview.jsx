import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../ui';
import { CANVAS } from '../../constants/physics';
import { useFlow } from '../flow/FlowProvider';
import { SceneManager } from '../../game/scene/SceneManager';
import { createMatchPreviewScene } from '../../game/scenes/matchPreviewScene';
import { createPauseOverlayScene } from '../../game/scenes/overlays';
import { CANVAS, SIMULATION } from '../../constants/physics';
import { nowSec, readGamepad } from '../../utils/helpers';
import {
  drawBackground,
  drawFighter,
  drawSpark,
  drawHitboxes,
  drawHUD
} from '../../game/rendering';
import {
  applyMovement,
  handleJump,
  handleDash,
  handleWallSlide,
  applyGravityAndIntegrate,
  handleFloorCollision,
  clampToBounds,
  updateFacing
} from '../../game/physics';
import { handleAttack, updateTimers, processCombat } from '../../game/combat';
import { updateAI } from '../../game/ai';
import { useFlow } from '../flow/FlowProvider';

/**
 * Match Preview screen with canvas-based gameplay
 * Reads fighters, stage, and config from centralized flow data
 */
const MatchPreview = () => {
  const { data, resetTo } = useFlow();
  const { config, p1, p2, stage } = data;
  const canvasRef = useRef(null);
  const managerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({ timer: config.timeLimit, p1HP: 100, p2HP: 100 });

  useEffect(() => {
    setHud((prev) => ({ ...prev, timer: config.timeLimit }));
  }, [config.timeLimit]);

  const meta = useMemo(
    () => ({
      p1: p1 || 'Rhea',
      p2: p2 === 'NPC' ? 'NPC' : p2,
      stage: stage || 'Dojo Dusk'
    }),
    [p1, p2, stage]
  );
  const [running, setRunning] = useState(true);
  const [timer, setTimer] = useState(config.timeLimit);

  useEffect(() => {
    setTimer(config.timeLimit);
  }, [config.timeLimit]);

  const meta = useMemo(
    () => ({
      p1: p1 || 'Rhea',
      p2: p2 === 'NPC' ? 'NPC' : p2,
      stage: stage || 'Dojo Dusk'
    }),
    [p1, p2, stage]
  );

  useEffect(() => {
    let animFrame = 0;
    let prevTime = performance.now();
    let accumulator = 0;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return undefined;

    const W = (canvasRef.current.width = CANVAS.WIDTH);
    const H = (canvasRef.current.height = CANVAS.HEIGHT);
    const floor = H - CANVAS.FLOOR_OFFSET;

    // Initialize fighters
    const f1 = {
      x: 200, y: floor, vx: 0, vy: 0, w: 40, h: 80,
      facing: 1, color: '#a5b4fc', hp: 100,
      grounded: true, lastGrounded: nowSec(),
      jumpBufferedAt: null, jumpsLeft: 2,
      dashing: false, dashT: 0, dashCD: 0,
      wallSlide: false, wallNormal: 0,
      hitstunT: 0, invulnT: 0, attackT: 0, spark: null
    };

    const f2 = {
      x: 760, y: floor, vx: 0, vy: 0, w: 40, h: 80,
      facing: -1, color: '#fca5a5', hp: 100,
      grounded: true, lastGrounded: nowSec(),
      jumpBufferedAt: null, jumpsLeft: 2,
      dashing: false, dashT: 0, dashCD: 0,
      wallSlide: false, wallNormal: 0,
      hitstunT: 0, invulnT: 0, attackT: 0, spark: null
    };

    // Input state
    const keys = {};
    let prevJump = false;
    let prevDash = false;
    let prevAtk = false;

    const onKeyDown = (e) => {
      const k = e.key;
      if (k === ' ' || e.code === 'Space') {
        keys['ArrowUp'] = true;
        e.preventDefault();
        return;
      }
      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        e.preventDefault();
        return;
      }
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        keys[k] = true;
        e.preventDefault();
        return;
      }
      if (k === 'Shift' || k === 'z' || k === 'Z') {
        keys[k] = true;
        e.preventDefault();
        return;
      }
      keys[k] = true;
    };

    const onKeyUp = (e) => {
      const k = e.key;
      if (k === ' ' || e.code === 'Space') {
        keys['ArrowUp'] = false;
        e.preventDefault();
        return;
      }
      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        e.preventDefault();
        return;
      }
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        keys[k] = false;
        e.preventDefault();
        return;
      }
      if (k === 'Shift' || k === 'z' || k === 'Z') {
        keys[k] = false;
        e.preventDefault();
        return;
      }
      keys[k] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const aiState = {
      dashCooldown: 0,
      desired: 0,
    };

    const stepSim = (dt) => {
      // Player input
      const gp = readGamepad();
      const left = keys['ArrowLeft'] || (gp.axisX < -0.25);
      const right = keys['ArrowRight'] || (gp.axisX > 0.25);
      const jumpHeld = keys['ArrowUp'] || gp.btnJump;
      const dashHeld = keys['Shift'] || gp.btnDash;
      const atkHeld = keys['z'] || keys['Z'] || gp.btnAtk;

      const jumpPressed = jumpHeld && !prevJump;
      const dashPressed = dashHeld && !prevDash;
      const atkPressed = atkHeld && !prevAtk;

      prevJump = jumpHeld;
      prevDash = dashHeld;
      prevAtk = atkHeld;

      // Buffer jump
      if (jumpPressed) f1.jumpBufferedAt = nowSec();

      // Player actions
      const desired = (right ? 1 : 0) + (left ? -1 : 0);
      const input = { desired, left, right, jumpPressed, jumpHeld };

      handleDash(f1, dashPressed, input, dt);
      handleAttack(f1, atkPressed);
      updateTimers(f1, dt);

      applyMovement(f1, input, dt);
      handleJump(f1, jumpPressed, jumpHeld);
      handleWallSlide(f1, input, jumpPressed);
      applyGravityAndIntegrate(f1, dt);
      handleFloorCollision(f1);
      clampToBounds(f1);
      updateFacing(f1, f2);

      // NPC AI
      updateAI(f2, f1, config.difficulty, dt, aiState);
      updateTimers(f2, dt);
      applyGravityAndIntegrate(f2, dt);
      handleFloorCollision(f2);
      clampToBounds(f2);
      updateFacing(f2, f1);

      // Combat
      const hitboxes = processCombat(f1, f2);

      // Timer
      if (timer > 0) {
        setTimer((s) => Math.max(0, s - dt));
      }

      // Render
      drawBackground(ctx, W, H, floor);
      drawFighter(ctx, f1);
      drawFighter(ctx, f2);
      drawSpark(ctx, f1.spark);
      drawSpark(ctx, f2.spark);
      drawHitboxes(ctx, hitboxes);
      drawHUD(ctx, {
        width: W,
        p1Name: meta.p1,
        p2Name: meta.p2,
        p1HP: f1.hp,
        p2HP: f2.hp,
        timer
      });
    };

    // Main loop
    const frame = (tMs) => {
      const t = tMs / 1000;
      const dt = Math.min(SIMULATION.MAX_FRAME_DT, t - prevTime / 1000);
      prevTime = tMs;

      if (running) {
        accumulator += dt;
        while (accumulator >= SIMULATION.FIXED_DT) {
          stepSim(SIMULATION.FIXED_DT);
          accumulator -= SIMULATION.FIXED_DT;
        }
      } else {
        stepSim(0);
      }

      animFrame = requestAnimationFrame(frame);
    };

    animFrame = requestAnimationFrame(frame);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const manager = new SceneManager({ canvas, width: CANVAS.WIDTH, height: CANVAS.HEIGHT });
    managerRef.current = manager;

    manager.register('match-preview', createMatchPreviewScene);
    manager.register('pause-overlay', createPauseOverlayScene({ hint: 'Resume to continue the simulation' }));

    manager.start('match-preview', { config, meta, onHUD: setHud });

    return () => manager.stop();
  }, [config, meta]);

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    const mgr = managerRef.current;
    if (!mgr) return;
    mgr.setPaused(next);
    if (next) {
      mgr.push('pause-overlay');
    } else if (mgr.peek()?.id === 'pause-overlay') {
      mgr.pop();
    } else {
      mgr.removeById('pause-overlay');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Stage</div>
            <div className="font-bold">{meta.stage}</div>
          </div>
          <div className="text-white/70">
            Rounds: {config.rounds} • Time: {Math.round(hud.timer)}s • Diff: {config.difficulty}
          </div>
          <div className="flex gap-2">
            <Button
              variant={paused ? 'primary' : 'danger'}
              onClick={togglePause}
              ariaLabel={paused ? 'Resume game' : 'Pause game'}
            >
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button onClick={() => resetTo('MainMenu')} ariaLabel="Exit to menu">
              Exit
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-white/10"
          aria-label="Game canvas"
        />
        <div className="mt-2 text-xs text-white/60">
          Controls: ← → move, Space jump (tap=short hop, hold=full). Shift=dash. Z=jab.
          Double-jump enabled. Hold toward a wall to slide; press jump to wall-jump.
          Gamepad supported (Stick + A/B/Y).
        </div>
      </Card>
    </motion.div>
  );
};

export default MatchPreview;
