import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, Settings, Save, BookOpen, Gamepad2, Swords, Sparkles } from "lucide-react";

// --- Simple design tokens ---
const Card = ({ className = "", children }: any) => (
  <div className={`rounded-2xl shadow-xl bg-white/5 backdrop-blur p-6 border border-white/10 ${className}`}>{children}</div>
);
const Button = ({ className = "", children, onClick, disabled, variant = "primary" }: any) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const v = variant === "primary"
    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
    : variant === "ghost"
    ? "bg-transparent hover:bg-white/10 text-white border border-white/10"
    : variant === "danger"
    ? "bg-rose-500 hover:bg-rose-600 text-white"
    : "bg-zinc-800 hover:bg-zinc-700 text-white";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${v} ${className}`}>{children}</button>
  );
};
const SectionTitle = ({ children }: any) => (
  <div className="text-sm uppercase tracking-widest text-white/60 mb-2">{children}</div>
);

// --- Types ---
 type Screen =
  | { id: "Landing" }
  | { id: "MainMenu" }
  | { id: "Start_Config" }
  | { id: "Start_Fighter" }
  | { id: "Start_Stage" }
  | { id: "Start_Preview" };

type MatchConfig = {
  rounds: number; // best of X
  timeLimit: number; // seconds per round
  difficulty: "Easy" | "Normal" | "Hard";
  control: "Keyboard" | "Gamepad" | "AI";
};

const defaultConfig: MatchConfig = {
  rounds: 3,
  timeLimit: 99,
  difficulty: "Normal",
  control: "Keyboard",
};

const fighters = [
  { id: "Rhea", style: "Sword", speed: 7, power: 6 },
  { id: "Kato", style: "Brawler", speed: 5, power: 8 },
  { id: "Miya", style: "Lancer", speed: 8, power: 5 },
  { id: "Dax", style: "Grappler", speed: 4, power: 9 },
  { id: "Vela", style: "Mageblade", speed: 6, power: 6 },
  { id: "Iko", style: "Nunchaku", speed: 9, power: 4 },
];

const stages = [
  { id: "Dojo Dusk", env: "Wood", friction: 0.9 },
  { id: "Sky Bridge", env: "Metal", friction: 0.8 },
  { id: "Bazaar Night", env: "Stone", friction: 0.85 },
  { id: "Glacier Gate", env: "Ice", friction: 0.6 },
];

// --- Main Component ---
export default function App() {
  const [screen, setScreen] = useState<Screen>({ id: "Landing" });
  const [menuFocused, setMenuFocused] = useState(0);
  const [config, setConfig] = useState<MatchConfig>(defaultConfig);
  const [p1, setP1] = useState<string | null>(null);
  const [p2, setP2] = useState<string>("NPC");
  const [stage, setStage] = useState<string | null>(null);

  // Accessibility: Enter to activate focused menu item
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen.id !== "MainMenu") return;
      const items = ["Start", "Continue", "Load", "Options"];
      if (e.key === "ArrowDown") setMenuFocused((i) => (i + 1) % items.length);
      if (e.key === "ArrowUp") setMenuFocused((i) => (i - 1 + items.length) % items.length);
      if (e.key === "Enter") {
        if (items[menuFocused] === "Start") setScreen({ id: "Start_Config" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuFocused, screen.id]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onBack={() => handleBack(screen, setScreen)} />
        <AnimatePresence mode="wait">
          {screen.id === "Landing" && (
            <Landing key="Landing" onEnter={() => setScreen({ id: "MainMenu" })} />
          )}
          {screen.id === "MainMenu" && (
            <MainMenu
              key="MainMenu"
              focusIndex={menuFocused}
              onStart={() => setScreen({ id: "Start_Config" })}
            />
          )}
          {screen.id === "Start_Config" && (
            <StartConfig
              key="Start_Config"
              config={config}
              setConfig={setConfig}
              onNext={() => setScreen({ id: "Start_Fighter" })}
            />
          )}
          {screen.id === "Start_Fighter" && (
            <FighterSelect
              key="Start_Fighter"
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              onNext={() => setScreen({ id: "Start_Stage" })}
            />
          )}
          {screen.id === "Start_Stage" && (
            <StageSelect
              key="Start_Stage"
              stage={stage}
              setStage={setStage}
              onNext={() => setScreen({ id: "Start_Preview" })}
            />
          )}
          {screen.id === "Start_Preview" && (
            <MatchPreview
              key="Start_Preview"
              config={config}
              p1={p1}
              p2={p2}
              stage={stage}
              onExit={() => setScreen({ id: "MainMenu" })}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Header ---
function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Sparkles className="opacity-70" />
        <div>
          <div className="text-xs uppercase tracking-widest text-white/60">Prototype</div>
          <h1 className="text-xl md:text-2xl font-bold">2D Fighter – UI Flow Preview</h1>
        </div>
      </div>
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>
    </div>
  );
}

function handleBack(screen: Screen, setScreen: (s: Screen) => void) {
  switch (screen.id) {
    case "Landing":
      return;
    case "MainMenu":
      setScreen({ id: "Landing" });
      return;
    case "Start_Config":
      setScreen({ id: "MainMenu" });
      return;
    case "Start_Fighter":
      setScreen({ id: "Start_Config" });
      return;
    case "Start_Stage":
      setScreen({ id: "Start_Fighter" });
      return;
    case "Start_Preview":
      setScreen({ id: "Start_Stage" });
      return;
  }
}

// --- Screens ---
function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid md:grid-cols-2 gap-6"
    >
      <Card className="col-span-1 flex items-center justify-center min-h-[280px]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold mb-2">Ascend: Ragdoll Arena</h2>
          <p className="text-white/70 max-w-md mx-auto">
            A mock of the front-to-back flow in a modern fighting game. Use keyboard or click to explore.
          </p>
          <Button className="mt-6" onClick={onEnter}>
            <Play className="mr-2 h-4 w-4" /> Enter
          </Button>
        </div>
      </Card>
      <Card className="col-span-1 min-h-[280px]">
        <SectionTitle>Included in this Preview</SectionTitle>
        <ul className="space-y-2 text-white/80">
          <li>• Landing → Main Menu</li>
          <li>• Start → Match Config → Fighter Select → Stage Select</li>
          <li>• Basic match preview with simple NPC AI</li>
        </ul>
        <SectionTitle className="mt-6">Not Implemented</SectionTitle>
        <ul className="space-y-2 text-white/60">
          <li>• Continue/Load (placeholder only)</li>
          <li>• Options (placeholder only)</li>
        </ul>
      </Card>
    </motion.div>
  );
}

function MainMenu({ focusIndex, onStart }: { focusIndex: number; onStart: () => void }) {
  const items = [
    { key: "Start", icon: <Swords className="mr-2" />, action: onStart, disabled: false },
    { key: "Continue", icon: <Gamepad2 className="mr-2" />, action: () => {}, disabled: true },
    { key: "Load", icon: <Save className="mr-2" />, action: () => {}, disabled: true },
    { key: "Options", icon: <Settings className="mr-2" />, action: () => {}, disabled: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 min-h-[320px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-2">Main Menu</h2>
            <p className="text-white/70">Use ↑/↓ and Enter or just click</p>
          </div>
        </Card>
        <Card className="min-h-[320px]">
          <SectionTitle>Menu</SectionTitle>
          <div className="flex flex-col gap-3">
            {items.map((it, i) => (
              <Button
                key={it.key}
                onClick={it.action}
                disabled={it.disabled}
                variant={i === focusIndex ? "primary" : "ghost"}
                className={i === focusIndex ? "ring-2 ring-indigo-400" : ""}
              >
                {it.icon}
                {it.key}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function StartConfig({ config, setConfig, onNext }: { config: MatchConfig; setConfig: (c: MatchConfig) => void; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Match Configuration</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Rounds (Best of)</label>
            <input
              type="number"
              min={1}
              max={9}
              value={config.rounds}
              onChange={(e) => setConfig({ ...config, rounds: clamp(parseInt(e.target.value || "3"), 1, 9) })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Time Limit (sec)</label>
            <input
              type="number"
              min={30}
              max={300}
              value={config.timeLimit}
              onChange={(e) => setConfig({ ...config, timeLimit: clamp(parseInt(e.target.value || "99"), 30, 300) })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Difficulty</label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as MatchConfig["difficulty"] })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            >
              <option>Easy</option>
              <option>Normal</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Player 1 Control</label>
            <select
              value={config.control}
              onChange={(e) => setConfig({ ...config, control: e.target.value as MatchConfig["control"] })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            >
              <option>Keyboard</option>
              <option>Gamepad</option>
              <option>AI</option>
            </select>
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle>Next</SectionTitle>
        <p className="text-white/70 mb-4">Continue to select fighters.</p>
        <Button onClick={onNext}><Swords className="mr-2" /> Choose Fighters</Button>
      </Card>
    </motion.div>
  );
}

function FighterSelect({ p1, setP1, p2, setP2, onNext }: { p1: string | null; setP1: (s: string | null) => void; p2: string; setP2: (s: string) => void; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Fighter Select</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {fighters.map((f) => (
            <button
              key={f.id}
              onClick={() => setP1(f.id)}
              className={`rounded-xl p-3 text-left border transition ${p1 === f.id ? "border-indigo-400 bg-indigo-400/10" : "border-white/10 hover:bg-white/5"}`}
            >
              <div className="text-lg font-bold">{f.id}</div>
              <div className="text-white/70 text-sm">{f.style}</div>
              <div className="mt-2 text-xs text-white/60">SPD {f.speed} • PWR {f.power}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle>Opponent</SectionTitle>
        <select
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option>NPC</option>
          {fighters.map((f) => (
            <option key={f.id} value={f.id}>{f.id}</option>
          ))}
        </select>
        <SectionTitle className="mt-4">Continue</SectionTitle>
        <Button onClick={onNext} disabled={!p1}>
          <BookOpen className="mr-2" /> Pick Stage
        </Button>
      </Card>
    </motion.div>
  );
}

function StageSelect({ stage, setStage, onNext }: { stage: string | null; setStage: (s: string | null) => void; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Stage Select</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {stages.map((s) => (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={`rounded-xl p-3 text-left border transition ${stage === s.id ? "border-indigo-400 bg-indigo-400/10" : "border-white/10 hover:bg-white/5"}`}
            >
              <div className="text-lg font-bold">{s.id}</div>
              <div className="text-white/70 text-sm">Surface: {s.env}</div>
              <div className="mt-2 text-xs text-white/60">Friction {s.friction}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle>Next</SectionTitle>
        <p className="text-white/70 mb-4">Preview a basic round with NPC movement.</p>
        <Button onClick={onNext} disabled={!stage}>
          <Play className="mr-2" /> Start Preview
        </Button>
      </Card>
    </motion.div>
  );
}

// --- Simple NPC preview on <canvas> ---
function MatchPreview({ config, p1, p2, stage, onExit }: { config: MatchConfig; p1: string | null; p2: string; stage: string | null; onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);
  const [timer, setTimer] = useState(config.timeLimit);

  const meta = useMemo(() => ({ p1: p1 ?? "Rhea", p2: p2 === "NPC" ? "NPC" : p2, stage: stage ?? "Dojo Dusk" }), [p1, p2, stage]);

  useEffect(() => {
    let anim = 0;
    let prev = performance.now();
    let acc = 0; // fixed-step accumulator
    const fixedDt = 1 / 120; // 120 Hz simulation

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Canvas size
    const W = (canvasRef.current!.width = 960);
    const H = (canvasRef.current!.height = 420);

    // Movement params (tuned for responsive fighting-game feel)
    const GRAVITY = 2600; // px/s^2
    const MAX_RUN = 380; // px/s
    const AIR_ACCEL = 2200; // px/s^2 when airborne
    const GROUND_ACCEL = 4200; // px/s^2 when grounded
    const GROUND_FRICTION = 5200; // px/s^2 decel when no input

    const JUMP_VEL = 880; // px/s initial jump velocity
    const MIN_JUMP_RELEASE = 420; // if released early, clamp upward speed
    const COYOTE_TIME = 0.12; // s after leaving ground where jump still allowed
    const JUMP_BUFFER = 0.12; // s before landing to buffer a jump

    const DASH_SPEED = 700; // px/s
    const DASH_TIME = 0.12; // s
    const DASH_COOLDOWN = 0.35; // s

    // Advanced movement
    const MAX_JUMPS = 2; // double jump
    const WALL_SLIDE_MAX = 180; // clamp downward speed while sliding
    const WALL_JUMP_VX = 520; const WALL_JUMP_VY = 900;

    const floor = H - 60;

    type Body = {
      x: number; y: number; vx: number; vy: number; w: number; h: number; facing: 1 | -1; color: string; hp: number;
      grounded: boolean; lastGrounded: number; jumpBufferedAt: number | null; jumpsLeft: number;
      dashing: boolean; dashT: number; dashCD: number;
      wallSlide: boolean; wallNormal: 1 | -1 | 0;
      hitstunT: number; invulnT: number;
      attackT: number; // >0 means attack timer running
      spark?: {x:number;y:number;t:number} | null;
    };

    const nowSec = () => performance.now() / 1000;

    const f1: Body = { x: 200, y: floor, vx: 0, vy: 0, w: 40, h: 80, facing: 1, color: "#a5b4fc", hp: 100, grounded: true, lastGrounded: nowSec(), jumpBufferedAt: null, jumpsLeft: MAX_JUMPS, dashing: false, dashT: 0, dashCD: 0, wallSlide: false, wallNormal: 0, hitstunT: 0, invulnT: 0, attackT: 0, spark: null };
    const f2: Body = { x: 760, y: floor, vx: 0, vy: 0, w: 40, h: 80, facing: -1, color: "#fca5a5", hp: 100, grounded: true, lastGrounded: nowSec(), jumpBufferedAt: null, jumpsLeft: MAX_JUMPS, dashing: false, dashT: 0, dashCD: 0, wallSlide: false, wallNormal: 0, hitstunT: 0, invulnT: 0, attackT: 0, spark: null };

    // --- Input (keyboard + gamepad) ---
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key;
      // Jump mapped to Space only; block other jump-like keys
      if (k === ' ' || e.code === 'Space') { keys['ArrowUp'] = true; e.preventDefault(); return; }
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); return; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') { keys[k] = true; e.preventDefault(); return; }
      if (k === 'Shift' || k === 'z' || k === 'Z') { keys[k] = true; e.preventDefault(); return; }
      keys[k] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === ' ' || e.code === 'Space') { keys['ArrowUp'] = false; e.preventDefault(); return; }
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); return; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') { keys[k] = false; e.preventDefault(); return; }
      if (k === 'Shift' || k === 'z' || k === 'Z') { keys[k] = false; e.preventDefault(); return; }
      keys[k] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // helpers for pressed events (buffered)
    let prevJump = false; let prevDash = false; let prevAtk = false;

    const readGamepad = () => {
      const gp = navigator.getGamepads?.()[0];
      let axisX = 0; let btnJump = false; let btnDash = false; let btnAtk = false;
      if (gp) {
        axisX = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0; // left stick X
        btnJump = !!gp.buttons[0]?.pressed; // A/Cross
        btnDash = !!gp.buttons[1]?.pressed || !!gp.buttons[2]?.pressed; // B/X
        btnAtk = !!gp.buttons[3]?.pressed; // Y/Square
      }
      return { axisX, btnJump, btnDash, btnAtk };
    };

    // NPC timing
    const diff = config.difficulty; // Easy/Normal/Hard alters reaction speed
    const thinkEvery = diff === "Easy" ? 0.60 : diff === "Normal" ? 0.40 : 0.25; // seconds
    let aiTimer = 0;

    const SHOW_HITBOX = true;

    // Simple AABB test
    const aabb = (a: {x:number;y:number;w:number;h:number}, b: {x:number;y:number;w:number;h:number}) => (
      Math.abs(a.x - b.x) * 2 < (a.w + b.w) && Math.abs(a.y - b.y) * 2 < (a.h + b.h)
    );

    // Simulation step + render
    const stepSim = (dt: number) => {
      const tNow = nowSec();

      // --- PLAYER INPUT ---
      const gp = readGamepad();
      const left = keys["ArrowLeft"] || (gp.axisX < -0.25);
      const right = keys["ArrowRight"] || (gp.axisX > 0.25);
      const jumpHeld = keys["ArrowUp"] || gp.btnJump;
      const dashHeld = keys["Shift"] || gp.btnDash;
      const atkHeld = keys["z"] || keys["Z"] || gp.btnAtk;

      // edge detection
      const jumpPressed = jumpHeld && !prevJump;
      const dashPressed = dashHeld && !prevDash;
      const atkPressed = atkHeld && !prevAtk;
      prevJump = jumpHeld; prevDash = dashHeld; prevAtk = atkHeld;

      // buffer jump
      if (jumpPressed) f1.jumpBufferedAt = tNow;

      // dash
      if (dashPressed && f1.dashCD <= 0 && !f1.dashing && f1.hitstunT <= 0) {
        f1.dashing = true; f1.dashT = DASH_TIME; f1.dashCD = DASH_COOLDOWN;
        const dir = right ? 1 : left ? -1 : f1.facing;
        f1.vx = dir * DASH_SPEED; f1.vy = 0;
      }

      // attack (simple jab with startup/active/recovery)
      const ATK_START = 0.06, ATK_ACTIVE = 0.06, ATK_REC = 0.18; // seconds
      if (atkPressed && f1.attackT <= 0 && f1.hitstunT <= 0) {
        f1.attackT = ATK_START + ATK_ACTIVE + ATK_REC;
      }

      // cooldowns / timers
      if (f1.dashCD > 0) f1.dashCD -= dt;
      if (f1.dashing) { f1.dashT -= dt; if (f1.dashT <= 0) f1.dashing = false; }
      if (f1.attackT > 0) f1.attackT -= dt;
      if (f1.hitstunT > 0) f1.hitstunT -= dt;
      if (f1.invulnT > 0) f1.invulnT -= dt;

      // movement (skip accel if dashing or in heavy hitstun)
      const desired = (right ? 1 : 0) + (left ? -1 : 0);
      const accel = f1.grounded ? GROUND_ACCEL : AIR_ACCEL;
      if (!f1.dashing && f1.hitstunT <= 0) {
        const target = desired * MAX_RUN;
        const delta = target - f1.vx;
        const maxDelta = accel * dt;
        if (Math.abs(delta) <= maxDelta) f1.vx = target; else f1.vx += Math.sign(delta) * maxDelta;
        if (desired === 0 && f1.grounded) {
          const sign = Math.sign(f1.vx);
          const mag = Math.max(0, Math.abs(f1.vx) - GROUND_FRICTION * dt);
          f1.vx = mag * sign;
        }
      }

      // jump consume (coyote + buffer + double jump)
      const canGroundJump = (tNow - f1.lastGrounded) <= COYOTE_TIME;
      const buffered = f1.jumpBufferedAt && (tNow - f1.jumpBufferedAt) <= JUMP_BUFFER;
      const tryJump = (force=false) => { f1.vy = -JUMP_VEL; f1.grounded = false; f1.jumpBufferedAt = null; if (!force) f1.jumpsLeft = Math.max(0, f1.jumpsLeft - 1); };
      if ((canGroundJump && (buffered || jumpPressed)) && f1.jumpsLeft === MAX_JUMPS) { tryJump(); }
      else if (jumpPressed && f1.jumpsLeft > 0 && !f1.grounded && !f1.wallSlide) { tryJump(); }

      // variable jump height
      if (!jumpHeld && f1.vy < -MIN_JUMP_RELEASE) f1.vy = -MIN_JUMP_RELEASE;

      // gravity baseline
      f1.vy += GRAVITY * dt;

      // integrate position pre-collision
      f1.x += f1.vx * dt; f1.y += f1.vy * dt;

      // walls detection (at boundaries)
      const nearLeft = f1.x <= 40; const nearRight = f1.x >= W - 40;
      const holdingLeft = left; const holdingRight = right;
      f1.wallSlide = false; f1.wallNormal = 0 as 0;
      if (!f1.grounded && ((nearLeft && holdingLeft) || (nearRight && holdingRight))) {
        f1.wallSlide = true; f1.wallNormal = nearLeft ? 1 : -1; // normal points inward
        if (f1.vy > WALL_SLIDE_MAX) f1.vy = WALL_SLIDE_MAX; // clamp fall
        if (jumpPressed) { // wall jump
          f1.vx = WALL_JUMP_VX * f1.wallNormal; f1.vy = -WALL_JUMP_VY;
          f1.facing = f1.wallNormal as 1 | -1; f1.wallSlide = false; f1.wallNormal = 0 as 0; f1.jumpsLeft = MAX_JUMPS - 1;
        }
      }

      // floor collide
      if (f1.y >= floor) { f1.y = floor; f1.vy = 0; if (!f1.grounded) f1.lastGrounded = tNow; f1.grounded = true; f1.jumpsLeft = MAX_JUMPS; }
      else { f1.grounded = false; }

      // bounds clamp
      f1.x = clamp(f1.x, 40, W - 40);

      // facing
      if (f1.hitstunT <= 0) f1.facing = (f2.x > f1.x) ? 1 : -1;

      // --- NPC AI ---
      if (f2.hitstunT > 0) { f2.hitstunT -= dt; }
      else {
        aiTimer += dt;
        if (aiTimer >= thinkEvery) {
          aiTimer = 0;
          const dist = f2.x - f1.x; const far = Math.abs(dist) > 180; const dir = Math.sign(dist);
          if (far) { const target = -dir * MAX_RUN * 0.75; const delta = target - f2.vx; const maxDelta = (f2.grounded ? GROUND_ACCEL : AIR_ACCEL) * thinkEvery; f2.vx += Math.sign(delta) * Math.min(Math.abs(delta), maxDelta); }
          else { f2.vx += (Math.random() - 0.5) * 120 * dt; if (Math.random() < 0.25 && f2.grounded) f2.vy = -JUMP_VEL * 0.9; }
          if (Math.random() < 0.15 && f2.attackT <= 0) f2.attackT = 0.06 + 0.06 + 0.18; // jab sometimes
        }
      }

      // NPC physics
      f2.vy += GRAVITY * dt; f2.x += f2.vx * dt; f2.y += f2.vy * dt;
      if (f2.y >= floor) { f2.y = floor; f2.vy = 0; f2.grounded = true; f2.lastGrounded = tNow; f2.jumpsLeft = MAX_JUMPS; } else f2.grounded = false;
      f2.x = clamp(f2.x, 40, W - 40); f2.facing = (f1.x > f2.x) ? 1 : -1;
      if (f2.attackT > 0) f2.attackT -= dt; if (f2.invulnT > 0) f2.invulnT -= dt;

      // --- Combat: simple jab hitbox vs body hurtbox ---
      const playerActive = f1.attackT > (ATK_REC) && f1.attackT <= (ATK_ACTIVE + ATK_REC);
      const npcActive = f2.attackT > (ATK_REC) && f2.attackT <= (ATK_ACTIVE + ATK_REC);

      const hurt1 = { x: f1.x, y: f1.y - f1.h/2, w: f1.w, h: f1.h };
      const hurt2 = { x: f2.x, y: f2.y - f2.h/2, w: f2.w, h: f2.h };

      const atk1 = playerActive ? { x: f1.x + f1.facing * (f1.w/2 + 18), y: f1.y - f1.h*0.65, w: 32, h: 22 } : null;
      const atk2 = npcActive ? { x: f2.x + f2.facing * (f2.w/2 + 18), y: f2.y - f2.h*0.65, w: 32, h: 22 } : null;

      if (atk1 && aabb(atk1, hurt2) && f2.invulnT <= 0) {
        f2.hp = Math.max(0, f2.hp - 8); f2.vx = 220 * f1.facing; f2.vy = -180; f2.hitstunT = 0.25; f2.invulnT = 0.12; f1.spark = { x: (atk1.x + hurt2.x)/2, y: (atk1.y + hurt2.y)/2, t: 0.12 };
      }
      if (atk2 && aabb(atk2, hurt1) && f1.invulnT <= 0) {
        f1.hp = Math.max(0, f1.hp - 6); f1.vx = 200 * f2.facing; f1.vy = -140; f1.hitstunT = 0.20; f1.invulnT = 0.10; f2.spark = { x: (atk2.x + hurt1.x)/2, y: (atk2.y + hurt1.y)/2, t: 0.12 };
      }

      // reduce spark timers
      if (f1.spark) { f1.spark.t -= dt; if (f1.spark.t <= 0) f1.spark = null; }
      if (f2.spark) { f2.spark.t -= dt; if (f2.spark.t <= 0) f2.spark = null; }

      // Countdown timer
      if (timer > 0) setTimer(function(s){ return Math.max(0, s - dt); });

      // --- RENDER ---
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0f172a"); grad.addColorStop(1, "#1e293b"); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0b1220"; ctx.fillRect(0, floor + 40, W, H - floor - 40);
      ctx.fillStyle = "#111827"; ctx.fillRect(0, floor, W, 4);

      drawFighter(ctx, f1); drawFighter(ctx, f2);

      // visual spark
      const drawSpark = function(s: any){ if (!s) return; ctx.save(); ctx.translate(s.x, s.y); ctx.fillStyle = "#ffe08a"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.globalAlpha = Math.max(0, s.t / 0.12); ctx.fill(); ctx.restore(); };
      drawSpark(f1.spark); drawSpark(f2.spark);

      // debug hitboxes
      if (SHOW_HITBOX) {
        ctx.save();
        if (atk1) { ctx.strokeStyle = "#22c55e"; ctx.strokeRect(atk1.x - atk1.w/2, atk1.y - atk1.h/2, atk1.w, atk1.h); }
        if (atk2) { ctx.strokeStyle = "#ef4444"; ctx.strokeRect(atk2.x - atk2.w/2, atk2.y - atk2.h/2, atk2.w, atk2.h); }
        ctx.strokeStyle = "#60a5fa"; ctx.strokeRect(hurt1.x - hurt1.w/2, hurt1.y - hurt1.h/2, hurt1.w, hurt1.h);
        ctx.strokeStyle = "#f472b6"; ctx.strokeRect(hurt2.x - hurt2.w/2, hurt2.y - hurt2.h/2, hurt2.w, hurt2.h);
        ctx.restore();
      }

      // HUD inline (dynamic HP + timer)
      ctx.save();
      ctx.fillStyle = "#111827"; ctx.fillRect(20, 20, 360, 16); ctx.fillStyle = "#a5b4fc"; ctx.fillRect(20, 20, 360 * Math.max(0, f1.hp/100), 16);
      ctx.fillStyle = "#111827"; ctx.fillRect(W - 380, 20, 360, 16); ctx.fillStyle = "#fca5a5"; ctx.fillRect(W - 380 + 360 * (1 - Math.max(0, f2.hp/100)), 20, 360 * Math.max(0, f2.hp/100), 16);
      ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.textAlign = "left"; ctx.fillText(meta.p1 + " " + Math.max(0, Math.round(f1.hp)) + " HP", 24, 32);
      ctx.textAlign = "right"; ctx.fillText(meta.p2 + " " + Math.max(0, Math.round(f2.hp)) + " HP", W - 24, 32);
      ctx.textAlign = "center"; ctx.font = "bold 20px ui-sans-serif, system-ui"; ctx.fillText(String(Math.max(0, Math.round(timer))), W/2, 36);
      ctx.restore();
    };

    // main RAF loop with fixed-step
    const frame = (tMs: number) => {
      const t = tMs / 1000;
      const dt = Math.min(0.05, t - prev / 1000); // clamp big gaps
      prev = tMs;

      if (running) { acc += dt; while (acc >= fixedDt) { stepSim(fixedDt); acc -= fixedDt; } }
      else { stepSim(0); }

      anim = requestAnimationFrame(frame);
    };

    anim = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [config.difficulty, meta, running]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Stage</div>
            <div className="font-bold">{meta.stage}</div>
          </div>
          <div className="text-white/70">Rounds: {config.rounds} • Time: {Math.round(timer)}s • Diff: {config.difficulty}</div>
          <div className="flex gap-2">
            <Button variant={running ? "danger" : "primary"} onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : "Resume"}
            </Button>
            <Button onClick={onExit}>Exit</Button>
          </div>
        </div>
      </Card>
      <Card>
        <canvas ref={canvasRef} className="w-full rounded-xl border border-white/10" />
        <div className="mt-2 text-xs text-white/60">Controls: ← → move, Space jump (tap=short hop, hold=full). Shift=dash. Z=jab. Double-jump enabled. Hold toward a wall to slide; press jump to wall-jump. Gamepad supported (Stick + A/B/Y).</div>
      </Card>
    </motion.div>
  );
}



// --- Helpers ---
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function drawFighter(ctx: CanvasRenderingContext2D, f: any) {
  ctx.save();
  ctx.translate(f.x, f.y);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath();
  ctx.ellipse(0, 40, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  ctx.fillStyle = f.color;
  roundRect(ctx, -f.w / 2, -f.h, f.w, f.h, 10);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.arc(0, -f.h - 18, 16, 0, Math.PI * 2);
  ctx.fill();
  // facing indicator
  ctx.fillStyle = "#fff";
  ctx.fillRect((f.facing > 0 ? 8 : -12), -f.h + 10, 4, 14);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawHUD(ctx: CanvasRenderingContext2D, { W, meta, timer }: any) {
  ctx.save();
  // p1 bar
  ctx.fillStyle = "#111827";
  ctx.fillRect(20, 20, 360, 16);
  ctx.fillStyle = "#a5b4fc";
  ctx.fillRect(20, 20, 360 * 0.92, 16);
  ctx.fillStyle = "#fff";
  ctx.font = "12px sans-serif";
  ctx.fillText(meta.p1, 24, 32);

  // p2 bar
  ctx.fillStyle = "#111827";
  ctx.fillRect(W - 380, 20, 360, 16);
  ctx.fillStyle = "#fca5a5";
  ctx.fillRect(W - 380 + 360 * 0.1, 20, 360 * 0.9, 16); // draw from the right-ish for contrast
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText(meta.p2, W - 24, 32);

  // timer
  ctx.textAlign = "center";
  ctx.font = "bold 20px ui-sans-serif, system-ui";
  ctx.fillText(String(Math.max(0, Math.round(timer))), W / 2, 36);

  ctx.restore();
}
