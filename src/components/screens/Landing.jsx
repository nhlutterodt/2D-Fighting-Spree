import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { useFlow } from '../flow/FlowProvider';

/**
 * Landing screen component
 * Uses the shared flow controller for navigation
 */
const Landing = () => {
  const { goTo } = useFlow();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid md:grid-cols-2 gap-6"
    >
      <Card className="col-span-1 flex items-center justify-center min-h-[280px]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold mb-2">Ascend: Ragdoll Arena</h2>
          <p className="text-white/70 max-w-md mx-auto">
            A mock of the front-to-back flow in a modern fighting game. Use keyboard or click to explore.
          </p>
          <Button
            className="mt-6"
            onClick={() => goTo('MainMenu')}
            ariaLabel="Enter the game"
          >
            <Play className="mr-2 h-4 w-4" aria-hidden="true" />
            Enter
          </Button>
        </div>
      </Card>

      <Card className="col-span-1 min-h-[280px]">
        <SectionTitle>Included in this Preview</SectionTitle>
        <ul className="space-y-2 text-white/80">
          <li>• Landing → Main Menu</li>
          <li>• Start → Match Config → Fighter Select → Stage Select</li>
          <li>• Basic match preview with simple NPC AI</li>
        </ul>

        <SectionTitle className="mt-6">Not Implemented</SectionTitle>
        <ul className="space-y-2 text-white/60">
          <li>• Continue/Load (placeholder only)</li>
          <li>• Options (placeholder only)</li>
        </ul>
      </Card>
    </motion.div>
  );
};

export default Landing;
