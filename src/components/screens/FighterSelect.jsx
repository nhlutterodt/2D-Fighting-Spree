import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { fighters } from '../../constants/gameData';
import { CANVAS } from '../../constants/physics';
import { useFlow } from '../flow/FlowProvider';
import { SceneManager } from '../../game/scene/SceneManager';
import { createCharacterSelectScene } from '../../game/scenes/characterSelectScene';

/**
 * Fighter Selection screen component
 * Pulls player selections from shared flow data and advances to the next step
 */
const FighterSelect = () => {
  const { data, updateData, goNext } = useFlow();
  const { p1, p2 } = data;
  const canvasRef = useRef(null);
  const [dualSelect, setDualSelect] = useState(p2 !== 'NPC');
  const [hovered, setHovered] = useState(() => fighters[0]);
  const initialRef = useRef({ p1, p2 });

  useEffect(() => {
    initialRef.current = { p1, p2 };
  }, [p1, p2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const manager = new SceneManager({ canvas, width: CANVAS.WIDTH, height: CANVAS.HEIGHT });

    manager.register('character-select', createCharacterSelectScene);

    manager.start('character-select', {
      fighters,
      config: { columns: 3, rows: 2, allowOpponentSelect: dualSelect },
      initial: { p1: initialRef.current.p1, p2: dualSelect ? initialRef.current.p2 : null },
      onSelection: ({ p1: nextP1, p2: nextP2 }) => {
        updateData({ p1: nextP1, p2: dualSelect ? nextP2 || nextP1 : 'NPC' });
      },
      onCursor: ({ fighter }) => setHovered((prev) => fighter ?? prev),
    });

    return () => manager.stop();
  }, [dualSelect, updateData]);

  const toggleDualSelect = () => {
    const next = !dualSelect;
    setDualSelect(next);
    if (!next) updateData({ p2: 'NPC' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="grid md:grid-cols-3 gap-6"
    >
      <Card className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Character Select Lab</h2>
            <p className="text-white/60 text-sm">Grid-based lock-ins inspired by classic fighters.</p>
          </div>
          <Button variant={dualSelect ? 'primary' : 'secondary'} onClick={toggleDualSelect} ariaLabel="Toggle opponent selection">
            {dualSelect ? 'Manual Opponent' : 'CPU Opponent'}
          </Button>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-white/10"
          aria-label="Character selection canvas"
        />
        <div className="text-xs text-white/60">
          Use arrows/WASD + Enter/Backspace to lock or undo. Dual-select toggles whether Player 2 is CPU or manually chosen.
        </div>
      </Card>

      <Card className="space-y-4">
        <SectionTitle>Current Picks</SectionTitle>
        <div className="space-y-2 text-white/80">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50">Player 1</div>
            <div className="font-semibold">{p1 || 'Unselected'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50">Player 2</div>
            <div className="font-semibold">{dualSelect ? p2 || 'Unselected' : 'NPC'}</div>
          </div>
        </div>

        <SectionTitle>Spotlight</SectionTitle>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{hovered?.id}</div>
            <div className="text-white/60 text-sm">{hovered?.style}</div>
          </div>
          <div className="text-xs text-white/50 mt-1">Speed {hovered?.speed} • Power {hovered?.power}</div>
          <div className="text-xs text-white/40">Street Fighter / Mortal Kombat style roster slot.</div>
        </div>

        <SectionTitle>Continue</SectionTitle>
        <Button
          onClick={goNext}
          disabled={!p1 || (dualSelect && !p2)}
          ariaLabel="Continue to stage selection"
        >
          <BookOpen className="mr-2" aria-hidden="true" />
          Pick Stage
        </Button>
      </Card>
    </motion.div>
  );
};

export default FighterSelect;
