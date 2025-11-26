import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Gamepad2, Save, Settings } from 'lucide-react';
import { Card, Button, SectionTitle } from '../ui';
import { menuItems } from '../../constants/gameData';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import { useFlow } from '../flow/FlowProvider';

/**
 * Main Menu screen component powered by the flow controller.
 * Keeps keyboard focus state in shared flow data for persistence.
 */
const MainMenu = () => {
  const { goTo, currentId, data, updateData } = useFlow();
  const focusIndex = data.menuFocus || 0;
  const isActive = currentId === 'MainMenu';

  const setMenuFocus = (value) =>
    updateData((prev) => ({
      ...prev,
      menuFocus: typeof value === 'function' ? value(prev.menuFocus || 0) : value,
    }));

  useKeyboardNavigation(
    isActive,
    focusIndex,
    setMenuFocus,
    menuItems.length,
    (index) => {
      if (index === 0) goTo('Start_Config');
    }
  );

  const iconMap = {
    Start: <Swords className="mr-2" aria-hidden="true" />,
    Continue: <Gamepad2 className="mr-2" aria-hidden="true" />,
    Load: <Save className="mr-2" aria-hidden="true" />,
    Options: <Settings className="mr-2" aria-hidden="true" />,
  };

  const actionMap = {
    Start: () => goTo('Start_Config'),
    Continue: () => {},
    Load: () => {},
    Options: () => {},
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 min-h-[320px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-2">Main Menu</h2>
            <p className="text-white/70">Use ↑/↓ and Enter or just click</p>
          </div>
        </Card>

        <Card className="min-h-[320px]">
          <SectionTitle>Menu</SectionTitle>
          <nav className="flex flex-col gap-3" role="navigation" aria-label="Main menu">
            {menuItems.map((item, i) => (
              <Button
                key={item.key}
                onClick={actionMap[item.key]}
                disabled={item.disabled}
                variant={i === focusIndex ? 'primary' : 'ghost'}
                className={i === focusIndex ? 'ring-2 ring-indigo-400' : ''}
                ariaLabel={`${item.key} ${item.disabled ? '(disabled)' : ''}`}
              >
                {iconMap[item.key]}
                {item.key}
              </Button>
            ))}
          </nav>
        </Card>
      </div>
    </motion.div>
  );
};

export default MainMenu;
