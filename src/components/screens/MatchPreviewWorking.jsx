import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Card, Button } from '../ui';

/**
 * Match Preview screen with canvas-based gameplay
 * This version keeps the original working game logic intact
 */
const MatchPreview = ({ config, p1, p2, stage, onExit }) => {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [timer, setTimer] = useState(config.timeLimit);

  const meta = useMemo(() => ({
    p1: p1 || 'Rhea',
    p2: p2 === 'NPC' ? 'NPC' : p2,
    stage: stage || 'Dojo Dusk'
  }), [p1, p2, stage]);

  useEffect(() => {
    let anim = 0;
    let prev = performance.now();
    let acc = 0;
    const fixedDt = 1 / 120;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const W = (canvasRef.current.width = 960);
    const H = (canvasRef.current.height = 420);

    // Physics constants
    const GRAVITY = 2600;
    const MAX_RUN = 380;
    const AIR_ACCEL = 2200;
    const GROUND_ACCEL = 4200;
    const GROUND_FRICTION = 5200;
    const JUMP_VEL = 880;
    const MIN_JUMP_RELEASE = 420;
    const COYOTE_TIME = 0.12;
    const JUMP_BUFFER = 0.12;
    const DASH_SPEED = 700;
    const DASH_TIME = 0.12;
    const DASH_COOLDOWN = 0.35;
    const MAX_JUMPS = 2;
    const WALL_SLIDE_MAX = 180;
    const WALL_JUMP_VX = 520;
    const WALL_JUMP_VY = 900;
    const floor = H - 60;

    const nowSec = () => performance.now() / 1000;
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

    const f1 = {
      x: 200, y: floor, vx: 0, vy: 0, w: 40, h: 80,
      facing: 1, color: '#a5b4fc', hp: 100,
      grounded: true, lastGrounded: 0,
      jumpBufferedAt: null, jumpsLeft: MAX_JUMPS,
      dashing: false, dashT: 0, dashCD: 0,
      wallSlide: false, wallNormal: 0,
      hitstunT: 0, invulnT: 0, attackT: 0, spark: null
    };

    const f2 = {
      x: 760, y: floor, vx: 0, vy: 0, w: 40, h: 80,
      facing: -1, color: '#fca5a5', hp: 100,
      grounded: true, lastGrounded: 0,
      jumpBufferedAt: null, jumpsLeft: MAX_JUMPS,
      dashing: false, dashT: 0, dashCD: 0,
      wallSlide: false, wallNormal: 0,
      hitstunT: 0, invulnT: 0, attackT: 0, spark: null
    };

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

    const readGamepad = () => {
      const gp = navigator.getGamepads?.()?.[0];
      let axisX = 0;
      let btnJump = false;
      let btnDash = false;
      let btnAtk = false;
      if (gp) {
        axisX = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
        btnJump = !!gp.buttons[0]?.pressed;
        btnDash = !!gp.buttons[1]?.pressed || !!gp.buttons[2]?.pressed;
        btnAtk = !!gp.buttons[3]?.pressed;
      }
      return { axisX, btnJump, btnDash, btnAtk };
    };

    const diff = config.difficulty;
    const thinkEvery = diff === 'Easy' ? 0.60 : diff === 'Normal' ? 0.40 : 0.25;
    let aiTimer = 0;

    const SHOW_HITBOX = true;

    const aabb = (a, b) => (
      Math.abs(a.x - b.x) * 2 < (a.w + b.w) &&
      Math.abs(a.y - b.y) * 2 < (a.h + b.h)
    );

    const roundRect = (ctx, x, y, w, h, r) => {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    const drawFighter = (ctx, f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath();
      ctx.ellipse(0, 40, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = f.color;
      roundRect(ctx, -f.w / 2, -f.h, f.w, f.h, 10);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -f.h - 18, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect((f.facing > 0 ? 8 : -12), -f.h + 10, 4, 14);
      ctx.restore();
    };

    const stepSim = (dt) => {
      const tNow = nowSec();

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

      if (jumpPressed) f1.jumpBufferedAt = tNow;

      // Dash
      if (dashPressed && f1.dashCD <= 0 && !f1.dashing && f1.hitstunT <= 0) {
        f1.dashing = true;
        f1.dashT = DASH_TIME;
        f1.dashCD = DASH_COOLDOWN;
        const dir = right ? 1 : left ? -1 : f1.facing;
        f1.vx = dir * DASH_SPEED;
        f1.vy = 0;
      }

      // Attack
      const ATK_START = 0.06, ATK_ACTIVE = 0.06, ATK_REC = 0.18;
      if (atkPressed && f1.attackT <= 0 && f1.hitstunT <= 0) {
        f1.attackT = ATK_START + ATK_ACTIVE + ATK_REC;
      }

      // Timers
      if (f1.dashCD > 0) f1.dashCD -= dt;
      if (f1.dashing) {
        f1.dashT -= dt;
        if (f1.dashT <= 0) f1.dashing = false;
      }
      if (f1.attackT > 0) f1.attackT -= dt;
      if (f1.hitstunT > 0) f1.hitstunT -= dt;
      if (f1.invulnT > 0) f1.invulnT -= dt;

      // Movement
      const desired = (right ? 1 : 0) + (left ? -1 : 0);
      const accel = f1.grounded ? GROUND_ACCEL : AIR_ACCEL;
      if (!f1.dashing && f1.hitstunT <= 0) {
        const target = desired * MAX_RUN;
        const delta = target - f1.vx;
        const maxDelta = accel * dt;
        if (Math.abs(delta) <= maxDelta) f1.vx = target;
        else f1.vx += Math.sign(delta) * maxDelta;
        if (desired === 0 && f1.grounded) {
          const sign = Math.sign(f1.vx);
          const mag = Math.max(0, Math.abs(f1.vx) - GROUND_FRICTION * dt);
          f1.vx = mag * sign;
        }
      }

      // Jump
      const canGroundJump = (tNow - f1.lastGrounded) <= COYOTE_TIME;
      const buffered = f1.jumpBufferedAt && (tNow - f1.jumpBufferedAt) <= JUMP_BUFFER;
      const tryJump = (force = false) => {
        f1.vy = -JUMP_VEL;
        f1.grounded = false;
        f1.jumpBufferedAt = null;
        if (!force) f1.jumpsLeft = Math.max(0, f1.jumpsLeft - 1);
      };
      if ((canGroundJump && (buffered || jumpPressed)) && f1.jumpsLeft === MAX_JUMPS) {
        tryJump();
      } else if (jumpPressed && f1.jumpsLeft > 0 && !f1.grounded && !f1.wallSlide) {
        tryJump();
      }

      if (!jumpHeld && f1.vy < -MIN_JUMP_RELEASE) f1.vy = -MIN_JUMP_RELEASE;

      // Gravity
      f1.vy += GRAVITY * dt;
      f1.x += f1.vx * dt;
      f1.y += f1.vy * dt;

      // Wall slide
      const nearLeft = f1.x <= 40;
      const nearRight = f1.x >= W - 40;
      const holdingLeft = left;
      const holdingRight = right;
      f1.wallSlide = false;
      f1.wallNormal = 0;
      if (!f1.grounded && ((nearLeft && holdingLeft) || (nearRight && holdingRight))) {
        f1.wallSlide = true;
        f1.wallNormal = nearLeft ? 1 : -1;
        if (f1.vy > WALL_SLIDE_MAX) f1.vy = WALL_SLIDE_MAX;
        if (jumpPressed) {
          f1.vx = WALL_JUMP_VX * f1.wallNormal;
          f1.vy = -WALL_JUMP_VY;
          f1.facing = f1.wallNormal;
          f1.wallSlide = false;
          f1.wallNormal = 0;
          f1.jumpsLeft = MAX_JUMPS - 1;
        }
      }

      // Floor
      if (f1.y >= floor) {
        f1.y = floor;
        f1.vy = 0;
        f1.lastGrounded = tNow; // Always update when on floor
        f1.grounded = true;
        f1.jumpsLeft = MAX_JUMPS;
      } else {
        f1.grounded = false;
      }

      f1.x = clamp(f1.x, 40, W - 40);
      if (f1.hitstunT <= 0) f1.facing = (f2.x > f1.x) ? 1 : -1;

      // NPC AI
      if (f2.hitstunT > 0) {
        f2.hitstunT -= dt;
      } else {
        aiTimer += dt;
        if (aiTimer >= thinkEvery) {
          aiTimer = 0;
          const dist = f2.x - f1.x;
          const far = Math.abs(dist) > 180;
          const dir = Math.sign(dist);
          if (far) {
            const target = -dir * MAX_RUN * 0.75;
            const delta = target - f2.vx;
            const maxDelta = (f2.grounded ? GROUND_ACCEL : AIR_ACCEL) * thinkEvery;
            f2.vx += Math.sign(delta) * Math.min(Math.abs(delta), maxDelta);
          } else {
            f2.vx += (Math.random() - 0.5) * 120 * dt;
            if (Math.random() < 0.25 && f2.grounded) f2.vy = -JUMP_VEL * 0.9;
          }
          if (Math.random() < 0.15 && f2.attackT <= 0) f2.attackT = 0.06 + 0.06 + 0.18;
        }
      }

      // NPC physics
      f2.vy += GRAVITY * dt;
      f2.x += f2.vx * dt;
      f2.y += f2.vy * dt;
      if (f2.y >= floor) {
        f2.y = floor;
        f2.vy = 0;
        f2.grounded = true;
        f2.lastGrounded = tNow;
        f2.jumpsLeft = MAX_JUMPS;
      } else {
        f2.grounded = false;
      }
      f2.x = clamp(f2.x, 40, W - 40);
      f2.facing = (f1.x > f2.x) ? 1 : -1;
      if (f2.attackT > 0) f2.attackT -= dt;
      if (f2.invulnT > 0) f2.invulnT -= dt;

      // Combat
      const playerActive = f1.attackT > ATK_REC && f1.attackT <= (ATK_ACTIVE + ATK_REC);
      const npcActive = f2.attackT > ATK_REC && f2.attackT <= (ATK_ACTIVE + ATK_REC);

      const hurt1 = { x: f1.x, y: f1.y - f1.h / 2, w: f1.w, h: f1.h };
      const hurt2 = { x: f2.x, y: f2.y - f2.h / 2, w: f2.w, h: f2.h };

      const atk1 = playerActive ? { x: f1.x + f1.facing * (f1.w / 2 + 18), y: f1.y - f1.h * 0.65, w: 32, h: 22 } : null;
      const atk2 = npcActive ? { x: f2.x + f2.facing * (f2.w / 2 + 18), y: f2.y - f2.h * 0.65, w: 32, h: 22 } : null;

      if (atk1 && aabb(atk1, hurt2) && f2.invulnT <= 0) {
        f2.hp = Math.max(0, f2.hp - 8);
        f2.vx = 220 * f1.facing;
        f2.vy = -180;
        f2.hitstunT = 0.25;
        f2.invulnT = 0.12;
        f1.spark = { x: (atk1.x + hurt2.x) / 2, y: (atk1.y + hurt2.y) / 2, t: 0.12 };
      }
      if (atk2 && aabb(atk2, hurt1) && f1.invulnT <= 0) {
        f1.hp = Math.max(0, f1.hp - 6);
        f1.vx = 200 * f2.facing;
        f1.vy = -140;
        f1.hitstunT = 0.20;
        f1.invulnT = 0.10;
        f2.spark = { x: (atk2.x + hurt1.x) / 2, y: (atk2.y + hurt1.y) / 2, t: 0.12 };
      }

      if (f1.spark) {
        f1.spark.t -= dt;
        if (f1.spark.t <= 0) f1.spark = null;
      }
      if (f2.spark) {
        f2.spark.t -= dt;
        if (f2.spark.t <= 0) f2.spark = null;
      }

      if (timer > 0) setTimer((s) => Math.max(0, s - dt));

      // Render
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, floor + 40, W, H - floor - 40);
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, floor, W, 4);

      drawFighter(ctx, f1);
      drawFighter(ctx, f2);

      // Sparks
      const drawSpark = (s) => {
        if (!s) return;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.fillStyle = '#ffe08a';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.globalAlpha = Math.max(0, s.t / 0.12);
        ctx.fill();
        ctx.restore();
      };
      drawSpark(f1.spark);
      drawSpark(f2.spark);

      // Hitboxes
      if (SHOW_HITBOX) {
        ctx.save();
        if (atk1) {
          ctx.strokeStyle = '#22c55e';
          ctx.strokeRect(atk1.x - atk1.w / 2, atk1.y - atk1.h / 2, atk1.w, atk1.h);
        }
        if (atk2) {
          ctx.strokeStyle = '#ef4444';
          ctx.strokeRect(atk2.x - atk2.w / 2, atk2.y - atk2.h / 2, atk2.w, atk2.h);
        }
        ctx.strokeStyle = '#60a5fa';
        ctx.strokeRect(hurt1.x - hurt1.w / 2, hurt1.y - hurt1.h / 2, hurt1.w, hurt1.h);
        ctx.strokeStyle = '#f472b6';
        ctx.strokeRect(hurt2.x - hurt2.w / 2, hurt2.y - hurt2.h / 2, hurt2.w, hurt2.h);
        ctx.restore();
      }

      // HUD
      ctx.save();
      ctx.fillStyle = '#111827';
      ctx.fillRect(20, 20, 360, 16);
      ctx.fillStyle = '#a5b4fc';
      ctx.fillRect(20, 20, 360 * Math.max(0, f1.hp / 100), 16);
      ctx.fillStyle = '#111827';
      ctx.fillRect(W - 380, 20, 360, 16);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(W - 380 + 360 * (1 - Math.max(0, f2.hp / 100)), 20, 360 * Math.max(0, f2.hp / 100), 16);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(meta.p1 + ' ' + Math.max(0, Math.round(f1.hp)) + ' HP', 24, 32);
      ctx.textAlign = 'right';
      ctx.fillText(meta.p2 + ' ' + Math.max(0, Math.round(f2.hp)) + ' HP', W - 24, 32);
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px ui-sans-serif, system-ui';
      ctx.fillText(String(Math.max(0, Math.round(timer))), W / 2, 36);
      ctx.restore();
    };

    const frame = (tMs) => {
      const t = tMs / 1000;
      const dt = Math.min(0.05, t - prev / 1000);
      prev = tMs;

      if (running) {
        acc += dt;
        while (acc >= fixedDt) {
          stepSim(fixedDt);
          acc -= fixedDt;
        }
      } else {
        stepSim(0);
      }

      anim = requestAnimationFrame(frame);
    };

    anim = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [config.difficulty, meta, running]);

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
            Rounds: {config.rounds} • Time: {Math.round(timer)}s • Diff: {config.difficulty}
          </div>
          <div className="flex gap-2">
            <Button
              variant={running ? 'danger' : 'primary'}
              onClick={() => setRunning((r) => !r)}
              ariaLabel={running ? 'Pause game' : 'Resume game'}
            >
              {running ? 'Pause' : 'Resume'}
            </Button>
            <Button onClick={onExit} ariaLabel="Exit to menu">
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

MatchPreview.propTypes = {
  config: PropTypes.shape({
    rounds: PropTypes.number.isRequired,
    timeLimit: PropTypes.number.isRequired,
    difficulty: PropTypes.oneOf(['Easy', 'Normal', 'Hard']).isRequired,
    control: PropTypes.oneOf(['Keyboard', 'Gamepad', 'AI']).isRequired,
  }).isRequired,
  p1: PropTypes.string,
  p2: PropTypes.string.isRequired,
  stage: PropTypes.string,
  onExit: PropTypes.func.isRequired,
};

export default MatchPreview;
