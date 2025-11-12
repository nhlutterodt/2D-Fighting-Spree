import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { clamp } from '../../utils/helpers';

/**
 * Match Configuration screen component
 * Enhanced with better form controls and validation
 */
const StartConfig = ({ config, setConfig, onNext }) => {
  const handleRoundsChange = (e) => {
    const value = clamp(parseInt(e.target.value || "3"), 1, 9);
    setConfig({ ...config, rounds: value });
  };

  const handleTimeLimitChange = (e) => {
    const value = clamp(parseInt(e.target.value || "99"), 30, 300);
    setConfig({ ...config, timeLimit: value });
  };

  const handleDifficultyChange = (e) => {
    setConfig({ ...config, difficulty: e.target.value });
  };

  const handleControlChange = (e) => {
    setConfig({ ...config, control: e.target.value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -6 }} 
      className="grid md:grid-cols-3 gap-6"
    >
      <Card className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Match Configuration</h2>
        <form className="grid sm:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="rounds" 
              className="block text-sm text-white/70 mb-1"
            >
              Rounds (Best of)
            </label>
            <input
              id="rounds"
              type="number"
              min={1}
              max={9}
              value={config.rounds}
              onChange={handleRoundsChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-describedby="rounds-help"
            />
            <span id="rounds-help" className="sr-only">
              Number of rounds to win the match, between 1 and 9
            </span>
          </div>
          
          <div>
            <label 
              htmlFor="timeLimit" 
              className="block text-sm text-white/70 mb-1"
            >
              Time Limit (sec)
            </label>
            <input
              id="timeLimit"
              type="number"
              min={30}
              max={300}
              value={config.timeLimit}
              onChange={handleTimeLimitChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-describedby="time-help"
            />
            <span id="time-help" className="sr-only">
              Time limit per round in seconds, between 30 and 300
            </span>
          </div>
          
          <div>
            <label 
              htmlFor="difficulty" 
              className="block text-sm text-white/70 mb-1"
            >
              Difficulty
            </label>
            <select
              id="difficulty"
              value={config.difficulty}
              onChange={handleDifficultyChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option>Easy</option>
              <option>Normal</option>
              <option>Hard</option>
            </select>
          </div>
          
          <div>
            <label 
              htmlFor="control" 
              className="block text-sm text-white/70 mb-1"
            >
              Player 1 Control
            </label>
            <select
              id="control"
              value={config.control}
              onChange={handleControlChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option>Keyboard</option>
              <option>Gamepad</option>
              <option>AI</option>
            </select>
          </div>
        </form>
      </Card>
      
      <Card>
        <SectionTitle>Next</SectionTitle>
        <p className="text-white/70 mb-4">Continue to select fighters.</p>
        <Button onClick={onNext} ariaLabel="Continue to fighter selection">
          <Swords className="mr-2" aria-hidden="true" /> 
          Choose Fighters
        </Button>
      </Card>
    </motion.div>
  );
};

StartConfig.propTypes = {
  config: PropTypes.shape({
    rounds: PropTypes.number.isRequired,
    timeLimit: PropTypes.number.isRequired,
    difficulty: PropTypes.oneOf(['Easy', 'Normal', 'Hard']).isRequired,
    control: PropTypes.oneOf(['Keyboard', 'Gamepad', 'AI']).isRequired,
  }).isRequired,
  setConfig: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default StartConfig;
