import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { fighters } from '../../constants/gameData';

/**
 * Fighter Selection screen component
 * Enhanced with better visual feedback and accessibility
 */
const FighterSelect = ({ p1, setP1, p2, setP2, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -6 }} 
      className="grid md:grid-cols-3 gap-6"
    >
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
              onClick={() => setP1(fighter.id)}
              className={`rounded-xl p-3 text-left border transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                p1 === fighter.id 
                  ? "border-indigo-400 bg-indigo-400/10" 
                  : "border-white/10 hover:bg-white/5"
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
          onChange={(e) => setP2(e.target.value)}
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
          onClick={onNext} 
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

FighterSelect.propTypes = {
  p1: PropTypes.string,
  setP1: PropTypes.func.isRequired,
  p2: PropTypes.string.isRequired,
  setP2: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default FighterSelect;
