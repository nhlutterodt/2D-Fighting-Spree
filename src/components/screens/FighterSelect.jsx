import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CornerDownLeft, CornerDownRight, Sparkles } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { fighters as defaultFighters } from '../../constants/gameData';
import { CANVAS } from '../../constants/physics';
import { useFlow } from '../flow/FlowProvider';
import { SceneManager } from '../../game/scene/SceneManager';
import { createCharacterSelectScene } from '../../game/scenes/characterSelectScene';

const INSTRUCTIONS = 'Arrows/WASD to move • Enter to lock • Backspace to undo';

/**
 * Adapter screen that mounts the canvas SceneManager and bridges
 * scene callbacks back into the FlowProvider data.
 */
const FighterSelect = () => {
  const { data, updateData, goBack, goNext } = useFlow();
  const { fighters = defaultFighters, p1, p2 } = data;
  const [selection, setSelection] = useState({ p1, p2 });
  const [hovered, setHovered] = useState(null);
  const canvasRef = useRef(null);

    const roster = useMemo(() => fighters || defaultFighters, [fighters]);
    const allowOpponentSelect = true;

  useEffect(() => {
    setSelection({ p1, p2 });
  }, [p1, p2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

      const manager = new SceneManager({ canvas, width: CANVAS.WIDTH, height: CANVAS.HEIGHT });

    manager.register('character-select', createCharacterSelectScene);
    manager.start('character-select', {
      fighters: roster,
      config: { allowOpponentSelect },
      initial: { p1, p2 },
      onSelection: ({ p1: nextP1, p2: nextP2 }) => {
        const normalizedP1 = nextP1 || null;
        const normalizedP2 = allowOpponentSelect ? nextP2 || null : p2;
        setSelection({ p1: normalizedP1, p2: normalizedP2 ?? 'NPC' });
        updateData((prev) => ({
          ...prev,
          p1: normalizedP1,
          p2: allowOpponentSelect ? normalizedP2 : prev.p2,
        }));
      },
      onCursor: ({ fighter }) => setHovered(fighter),
    });

    return () => manager.stop();
  }, [allowOpponentSelect, p1, p2, roster, updateData]);

  useEffect(() => {
    const handleGlobalKeys = (event) => {
      if (event.key === 'Escape') {
        goBack();
      }
      if (event.key === 'Enter' && selection.p1 && (allowOpponentSelect ? selection.p2 : true)) {
        goNext();
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [allowOpponentSelect, goBack, goNext, selection.p1, selection.p2]);

  const handleContinue = () => {
    if (!selection.p1) return;
    goNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="space-y-4"
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Fighter Lab</div>
            <div className="text-xl font-bold">Scene-backed Character Select</div>
            <div className="text-white/60 text-sm">{INSTRUCTIONS}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={goBack} ariaLabel="Return to previous step">
              <CornerDownLeft className="mr-2" aria-hidden="true" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={!selection.p1 || (allowOpponentSelect && !selection.p2)}
              ariaLabel="Continue to stage selection"
            >
              <CornerDownRight className="mr-2" aria-hidden="true" />
              Pick Stage
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-white/10"
          aria-label="Character selection canvas"
        />
        <div className="mt-2 text-xs text-white/60">Press Escape to exit or Enter to accept once both slots are locked.</div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="space-y-3">
          <SectionTitle>Selection</SectionTitle>
          <div className="text-white/80">
            <div className="text-xs uppercase tracking-widest text-white/50">Player 1</div>
            <div className="font-semibold">{selection.p1 || 'Unselected'}</div>
          </div>
          <div className="text-white/80">
            <div className="text-xs uppercase tracking-widest text-white/50">Player 2</div>
            <div className="font-semibold">{selection.p2 || 'NPC'}</div>
          </div>
        </Card>

        <Card className="md:col-span-2 space-y-3">
          <SectionTitle>Spotlight</SectionTitle>
          {hovered ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{hovered.id}</div>
                <div className="text-white/60 text-sm">{hovered.style}</div>
                <div className="text-xs text-white/50">Speed {hovered.speed} • Power {hovered.power}</div>
              </div>
              <Sparkles className="text-indigo-300" aria-hidden="true" />
            </div>
          ) : (
            <div className="text-white/60 text-sm">Hover a slot to preview stats.</div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default FighterSelect;
