import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../ui';
import { CANVAS } from '../../constants/physics';
import { useFlow } from '../flow/FlowProvider';
import { SceneManager } from '../../game/scene/SceneManager';
import { createMatchPreviewScene } from '../../game/scenes/matchPreviewScene';
import { createPauseOverlayScene } from '../../game/scenes/overlays';

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
