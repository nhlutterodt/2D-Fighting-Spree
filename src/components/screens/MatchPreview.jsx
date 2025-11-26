import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Pause, Play } from 'lucide-react';
import { Card, Button } from '../ui';
import { CANVAS } from '../../constants/physics';
import { useFlow } from '../flow/FlowProvider';
import { SceneManager } from '../../game/scene/SceneManager';
import { createMatchPreviewScene } from '../../game/scenes/matchPreviewScene';
import { createPauseOverlayScene } from '../../game/scenes/overlays';
import DevOverlay from '../ui/DevOverlay';

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
  const [devOpen, setDevOpen] = useState(false);
  const [hud, setHud] = useState({ timer: config.timeLimit, p1HP: 100, p2HP: 100 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setHud((prev) => ({ ...prev, timer: config.timeLimit }));
  }, [config.timeLimit]);

  const meta = useMemo(
    () => ({
      p1: p1 || 'Rhea',
      p2: p2 === 'NPC' ? 'NPC' : p2,
      stage: stage || 'Dojo Dusk',
    }),
    [p1, p2, stage],
  );

  const pushLog = useCallback((level, message, metaData) => {
    setLogs((prev) => {
      const entry = { id: `${Date.now()}-${prev.length}`, ts: Date.now(), level, message, meta: metaData };
      const next = [...prev, entry];
      return next.slice(-80);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const forwardLog = (level, message, metaData) => {
      const impl = console?.[level] ?? console.log;
      impl?.(message, metaData);
      pushLog(level, message, metaData);
    };

    const logger = {
      debug: (message, metaData) => forwardLog('debug', message, metaData),
      info: (message, metaData) => forwardLog('info', message, metaData),
      warn: (message, metaData) => forwardLog('warn', message, metaData),
      error: (message, metaData) => forwardLog('error', message, metaData),
      log: (message, metaData) => forwardLog('log', message, metaData),
    };

    const manager = new SceneManager({ canvas, width: CANVAS.WIDTH, height: CANVAS.HEIGHT, logger, logLevel: 'info' });
    managerRef.current = manager;

    manager.register('match-preview', createMatchPreviewScene);
    manager.register('pause-overlay', createPauseOverlayScene({ hint: 'Resume to continue the simulation' }));

    manager.start('match-preview', { config, meta, onHUD: setHud });

    const handleKeyToggle = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setDevOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyToggle);

    return () => {
      window.removeEventListener('keydown', handleKeyToggle);
      manager.stop();
      managerRef.current = null;
    };
  }, [config, meta, pushLog]);

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
              <span className="flex items-center gap-2">
                {paused ? <Play size={16} /> : <Pause size={16} />} {paused ? 'Resume' : 'Pause'}
              </span>
            </Button>
            <Button onClick={() => resetTo('MainMenu')} ariaLabel="Exit to menu">
              Exit
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl border border-white/10"
              aria-label="Game canvas"
            />
            <Button
              variant="secondary"
              className="absolute right-3 top-3 flex items-center gap-2 px-3 py-2 text-xs"
              onClick={() => setDevOpen((open) => !open)}
              ariaLabel="Toggle developer overlay"
            >
              <Bug size={14} /> Dev
            </Button>
          </div>

          <DevOverlay
            open={devOpen}
            manager={managerRef.current}
            logs={logs}
            onToggle={() => setDevOpen((open) => !open)}
          />
        </div>

        <div className="mt-2 text-xs text-white/60">
          Controls: ← → move, Space jump (tap=short hop, hold=full). Shift=dash. Z=jab.
          Double-jump enabled. Hold toward a wall to slide; press jump to wall-jump.
          Gamepad supported (Stick + A/B/Y). Toggle dev overlay with F1.
        </div>
      </Card>
    </motion.div>
  );
};

export default MatchPreview;
