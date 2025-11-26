import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { stages } from '../../constants/gameData';
import { useFlow } from '../flow/FlowProvider';

/**
 * Stage Selection screen component
 * Uses shared flow data for stage selection
 */
const StageSelect = () => {
  const { data, updateData, goNext } = useFlow();
  const { stage } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="grid md:grid-cols-3 gap-6"
    >
      <Card className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Stage Select</h2>
        <div
          className="grid sm:grid-cols-2 gap-3"
          role="radiogroup"
          aria-label="Select battle stage"
        >
          {stages.map((stg) => (
            <button
              key={stg.id}
              onClick={() => updateData({ stage: stg.id })}
              className={`rounded-xl p-3 text-left border transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                stage === stg.id
                  ? 'border-indigo-400 bg-indigo-400/10'
                  : 'border-white/10 hover:bg-white/5'
              }`}
              role="radio"
              aria-checked={stage === stg.id}
              aria-label={`Select ${stg.id}, ${stg.env} surface, friction ${stg.friction}`}
            >
              <div className="text-lg font-bold">{stg.id}</div>
              <div className="text-white/70 text-sm">Surface: {stg.env}</div>
              <div className="mt-2 text-xs text-white/60">
                Friction {stg.friction}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Next</SectionTitle>
        <p className="text-white/70 mb-4">
          Preview a basic round with NPC movement.
        </p>
        <Button
          onClick={goNext}
          disabled={!stage}
          ariaLabel="Start match preview"
        >
          <Play className="mr-2" aria-hidden="true" />
          Start Preview
        </Button>
      </Card>
    </motion.div>
  );
};

export default StageSelect;
