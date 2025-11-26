import React, { useEffect, useRef, useState } from 'react';
import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import PropTypes from 'prop-types';
import { Card, Button, SectionTitle } from '../ui';
import { fighters } from '../../constants/gameData';
import { CANVAS } from '../../constants/physics';
import { useFlow } from '../flow/FlowProvider';
import { SceneManager } from '../../game/scene/SceneManager';
import { createCharacterSelectScene } from '../../game/scenes/characterSelectScene';

const FighterButton = React.memo(function FighterButton({ fighter, isSelected, onSelect }) {
  const { id, style, speed, power } = fighter;

  return (
    <button
      onClick={onSelect}
      className={`rounded-xl p-3 text-left border transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        isSelected ? 'border-indigo-400 bg-indigo-400/10' : 'border-white/10 hover:bg-white/5'
      }`}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select ${id}, ${style} style, speed ${speed}, power ${power}`}
    >
      <div className="text-lg font-bold">{id}</div>
      <div className="text-white/70 text-sm">{style}</div>
      <div className="mt-2 text-xs text-white/60">SPD {speed} • PWR {power}</div>
    </button>
  );
});

FighterButton.propTypes = {
  fighter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    style: PropTypes.string.isRequired,
    speed: PropTypes.number.isRequired,
    power: PropTypes.number.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

/**
 * Fighter Selection screen component
 * Pulls player selections from shared flow data and advances to the next step
 */
const FighterSelect = ({
  roster = fighters,
  opponentRoster,
  allowNpcOpponent = true,
  title = 'Fighter Select',
  opponentLabel = 'Opponent',
  continueLabel = 'Pick Stage',
}) => {
  const { data, updateData, goNext } = useFlow();
  const { p1, p2 } = data;

  const availableOpponents = useMemo(() => {
    const source = opponentRoster?.length ? opponentRoster : roster;
    return allowNpcOpponent ? ['NPC', ...source.map((fighter) => fighter.id)] : source.map((fighter) => fighter.id);
  }, [allowNpcOpponent, opponentRoster, roster]);

  const handleSelectFighter = useCallback(
    (id) => {
      updateData({ p1: id });
    },
    [updateData]
  );

  const handleSelectOpponent = useCallback(
    (value) => {
      updateData({ p2: value });
    },
    [updateData]
  );

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
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div
          className="grid sm:grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Select your fighter"
        >
          {roster.map((fighter) => (
            <FighterButton
              key={fighter.id}
              fighter={fighter}
              isSelected={p1 === fighter.id}
              onSelect={() => handleSelectFighter(fighter.id)}
            />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>{opponentLabel}</SectionTitle>
        <label htmlFor="opponent-select" className="sr-only">
          Select opponent option
        </label>
        <select
          id="opponent-select"
          value={p2}
          onChange={(e) => handleSelectOpponent(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {availableOpponents.map((option) => (
            <option key={option} value={option}>
              {option}
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
          {continueLabel}
        </Button>
      </Card>
    </motion.div>
  );
};

FighterSelect.propTypes = {
  roster: PropTypes.arrayOf(FighterButton.propTypes.fighter),
  opponentRoster: PropTypes.arrayOf(FighterButton.propTypes.fighter),
  allowNpcOpponent: PropTypes.bool,
  title: PropTypes.string,
  opponentLabel: PropTypes.string,
  continueLabel: PropTypes.string,
};

export default FighterSelect;
