import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Layers, PauseCircle, PlayCircle } from 'lucide-react';
import Button from './Button';

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const LogList = ({ logs }) => (
  <div className="space-y-2 overflow-y-auto rounded-lg bg-slate-900/60 p-3 text-xs text-white/70 shadow-inner max-h-60">
    {logs.length === 0 && <div className="text-white/40">No logs yet.</div>}
    {logs
      .slice(-25)
      .reverse()
      .map((log) => (
        <div key={log.id} className="flex gap-2">
          <span className="text-white/50">{formatTime(log.ts)}</span>
          <span className="uppercase text-[10px] text-amber-200">{log.level}</span>
          <span className="flex-1 text-white/80">{log.message}</span>
        </div>
      ))}
  </div>
);

LogList.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      ts: PropTypes.number,
      level: PropTypes.string,
      message: PropTypes.string,
    }),
  ).isRequired,
};

const DevOverlay = ({ open, manager, logs, onToggle }) => {
  const [snapshot, setSnapshot] = useState({
    paused: false,
    running: false,
    environment: {},
    stack: [],
    entities: { total: 0, byType: {} },
    input: null,
  });

  useEffect(() => {
    if (!manager || !open) return undefined;
    let rafId;

    const tick = () => {
      const stack = manager.getStackSnapshot?.() ?? [];
      const environment = manager.environment ?? {};
      const entitySnapshot = manager.entities?.snapshot?.() ?? [];
      const byType = entitySnapshot.reduce((acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1;
        return acc;
      }, {});
      const input = manager.input?.debugSnapshot?.();

      setSnapshot({
        paused: manager.paused,
        running: manager.running,
        environment,
        stack,
        entities: { total: entitySnapshot.length, byType },
        input,
      });

      rafId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafId);
  }, [manager, open]);

  const inputSummary = useMemo(() => {
    if (!snapshot.input) return 'No input data';
    const held = [...(snapshot.input.heldKeys ?? [])];
    const pressedActions = Object.entries(snapshot.input.actions || {})
      .filter(([, action]) => action.pressed)
      .map(([name]) => name);
    return `Held keys: ${held.join(', ') || '—'} | Pressed actions: ${
      pressedActions.join(', ') || '—'
    } | AxisX: ${snapshot.input.gamepad?.axisX?.toFixed?.(2) ?? '0.00'}`;
  }, [snapshot.input]);

  if (!open) return null;

  return (
    <div className="md:w-96 space-y-3 rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-white/80 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Layers size={18} /> Dev Overlay
        </div>
        <Button variant="ghost" className="px-3 py-1 text-xs" onClick={onToggle} ariaLabel="Close developer overlay">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-800/70 p-3">
          <div className="text-white/60">Runtime</div>
          <div className="mt-1 flex items-center gap-2 font-semibold text-white">
            {snapshot.paused ? <PauseCircle size={16} className="text-amber-300" /> : <PlayCircle size={16} className="text-emerald-300" />}
            {snapshot.paused ? 'Paused' : 'Running'}
          </div>
          <div className="text-white/50">Stack depth: {snapshot.stack.length}</div>
        </div>
        <div className="rounded-lg bg-slate-800/70 p-3">
          <div className="text-white/60">Entities</div>
          <div className="mt-1 font-semibold text-white">Total: {snapshot.entities.total}</div>
          <div className="text-white/50">{Object.entries(snapshot.entities.byType).map(([type, count]) => `${type}: ${count}`).join(' • ') || 'None'}</div>
        </div>
      </div>

      <div className="rounded-lg bg-slate-800/70 p-3 text-xs">
        <div className="text-white/60">Stack</div>
        <div className="mt-1 space-y-1 text-white/80">
          {snapshot.stack.map((scene) => (
            <div key={`${scene.id}-${scene.index}`} className="flex justify-between rounded bg-white/5 px-2 py-1">
              <span>{scene.index}: {scene.id}</span>
              <span className="text-white/50">{scene.metadata ? JSON.stringify(scene.metadata) : '—'}</span>
            </div>
          ))}
          {snapshot.stack.length === 0 && <div className="text-white/50">No scenes loaded.</div>}
        </div>
      </div>

      <div className="rounded-lg bg-slate-800/70 p-3 text-xs">
        <div className="text-white/60">Environment</div>
        <pre className="mt-1 whitespace-pre-wrap rounded bg-black/40 p-2 text-[11px] text-emerald-100">{JSON.stringify(snapshot.environment, null, 2)}</pre>
      </div>

      <div className="rounded-lg bg-slate-800/70 p-3 text-xs">
        <div className="text-white/60">Input</div>
        <div className="mt-1 text-white/80">{inputSummary}</div>
      </div>

      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-white/50">Scene + Env Logs</div>
        <LogList logs={logs} />
      </div>
    </div>
  );
};

DevOverlay.propTypes = {
  open: PropTypes.bool,
  manager: PropTypes.shape({
    getStackSnapshot: PropTypes.func,
    entities: PropTypes.object,
    input: PropTypes.object,
    environment: PropTypes.object,
    paused: PropTypes.bool,
    running: PropTypes.bool,
  }),
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      ts: PropTypes.number,
      level: PropTypes.string,
      message: PropTypes.string,
    }),
  ).isRequired,
  onToggle: PropTypes.func,
};

DevOverlay.defaultProps = {
  open: false,
  manager: null,
  logs: [],
  onToggle: undefined,
};

export default DevOverlay;
