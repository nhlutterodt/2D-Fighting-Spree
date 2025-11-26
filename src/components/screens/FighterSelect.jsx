import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import PropTypes from 'prop-types';
import { Card, Button, SectionTitle } from '../ui';
import { fighters } from '../../constants/gameData';
import { useFlow } from '../flow/FlowProvider';

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
