import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import { FlowProvider, FlowStepRenderer, useFlow } from './flow/FlowProvider';
import { FLOW_STEPS } from '../constants/flowSteps';
import { defaultConfig } from '../constants/gameData';

const AppShell = () => {
  const { goBack } = useFlow();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onBack={goBack} />
        <AnimatePresence mode="wait">
          <FlowStepRenderer />
        </AnimatePresence>
      </div>
    </div>
  );
};

const FighterApp = () => (
  <FlowProvider
    steps={FLOW_STEPS}
    initialStep="Landing"
    initialData={{
      config: { ...defaultConfig },
      p1: null,
      p2: 'NPC',
      stage: null,
      menuFocus: 0,
    }}
  >
    <AppShell />
  </FlowProvider>
);

export default FighterApp;
