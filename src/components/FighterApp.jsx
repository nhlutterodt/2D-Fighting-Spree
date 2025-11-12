import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import {
  Landing,
  MainMenu,
  StartConfig,
  FighterSelect,
  StageSelect,
  MatchPreview
} from './screens';
import { defaultConfig } from '../constants/gameData';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';

/**
 * Main application component
 * Enhanced with better state management and navigation
 */
const FighterApp = () => {
  const [screen, setScreen] = useState({ id: 'Landing' });
  const [menuFocused, setMenuFocused] = useState(0);
  const [config, setConfig] = useState(defaultConfig);
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState('NPC');
  const [stage, setStage] = useState(null);

  // Keyboard navigation for main menu
  useKeyboardNavigation(
    screen.id === 'MainMenu',
    menuFocused,
    setMenuFocused,
    4,
    (index) => {
      if (index === 0) setScreen({ id: 'Start_Config' });
    }
  );

  const handleBack = () => {
    switch (screen.id) {
      case 'Landing':
        return;
      case 'MainMenu':
        setScreen({ id: 'Landing' });
        break;
      case 'Start_Config':
        setScreen({ id: 'MainMenu' });
        break;
      case 'Start_Fighter':
        setScreen({ id: 'Start_Config' });
        break;
      case 'Start_Stage':
        setScreen({ id: 'Start_Fighter' });
        break;
      case 'Start_Preview':
        setScreen({ id: 'Start_Stage' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onBack={handleBack} />
        
        <AnimatePresence mode="wait">
          {screen.id === 'Landing' && (
            <Landing
              key="Landing"
              onEnter={() => setScreen({ id: 'MainMenu' })}
            />
          )}
          
          {screen.id === 'MainMenu' && (
            <MainMenu
              key="MainMenu"
              focusIndex={menuFocused}
              onStart={() => setScreen({ id: 'Start_Config' })}
            />
          )}
          
          {screen.id === 'Start_Config' && (
            <StartConfig
              key="Start_Config"
              config={config}
              setConfig={setConfig}
              onNext={() => setScreen({ id: 'Start_Fighter' })}
            />
          )}
          
          {screen.id === 'Start_Fighter' && (
            <FighterSelect
              key="Start_Fighter"
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              onNext={() => setScreen({ id: 'Start_Stage' })}
            />
          )}
          
          {screen.id === 'Start_Stage' && (
            <StageSelect
              key="Start_Stage"
              stage={stage}
              setStage={setStage}
              onNext={() => setScreen({ id: 'Start_Preview' })}
            />
          )}
          
          {screen.id === 'Start_Preview' && (
            <MatchPreview
              key="Start_Preview"
              config={config}
              p1={p1}
              p2={p2}
              stage={stage}
              onExit={() => setScreen({ id: 'MainMenu' })}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FighterApp;
