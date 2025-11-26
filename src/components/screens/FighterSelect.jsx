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
      <Card className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Fighter Select</h2>
        <div
          className="grid sm:grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Select your fighter"
        >
          {fighters.map((fighter) => (
            <button
              key={fighter.id}
              onClick={() => updateData({ p1: fighter.id })}
              className={`rounded-xl p-3 text-left border transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                p1 === fighter.id
                  ? 'border-indigo-400 bg-indigo-400/10'
                  : 'border-white/10 hover:bg-white/5'
              }`}
              role="radio"
              aria-checked={p1 === fighter.id}
              aria-label={`Select ${fighter.id}, ${fighter.style} style, speed ${fighter.speed}, power ${fighter.power}`}
            >
              <div className="text-lg font-bold">{fighter.id}</div>
              <div className="text-white/70 text-sm">{fighter.style}</div>
              <div className="mt-2 text-xs text-white/60">
                SPD {fighter.speed} • PWR {fighter.power}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Opponent</SectionTitle>
        <label htmlFor="opponent-select" className="sr-only">
          Select opponent
        </label>
        <select
          id="opponent-select"
          value={p2}
          onChange={(e) => updateData({ p2: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option>NPC</option>
          {fighters.map((fighter) => (
            <option key={fighter.id} value={fighter.id}>
              {fighter.id}
            </option>
          ))}
        </select>

        <SectionTitle className="mt-4">Continue</SectionTitle>
        <Button
          onClick={goNext}
          disabled={!p1}
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
