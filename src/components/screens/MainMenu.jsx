import React, { useMemo } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Gamepad2, Save, Settings } from 'lucide-react';
import { Card, SectionTitle } from '../ui';
import { menuItems } from '../../constants/gameData';
import { useFlow } from '../flow/FlowProvider';
import { MenuProvider, MenuList, MenuOption } from '../menu';

/**
 * Main Menu screen component powered by the shared menu framework.
 * Uses MenuProvider for focus management, keyboard controls, and activation so
 * future menus (pause overlays, option screens) can share the same behavior.
 */
const MainMenu = () => {
  const { goTo, currentId, data, updateData } = useFlow();
  const isActive = currentId === 'MainMenu';
  const focusIndex = data.menuFocus || 0;

  const items = useMemo(
    () =>
      menuItems.map((item) => ({
        ...item,
        id: item.key.toLowerCase(),
        label: item.key,
        description: item.description,
        icon: item.icon,
        onSelect: () => {
          if (item.key === 'Start') goTo('Start_Config');
        },
      })),
    [goTo]
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
    Start: <Swords className="mr-3" aria-hidden="true" />,
    Continue: <Gamepad2 className="mr-3" aria-hidden="true" />,
    Load: <Save className="mr-3" aria-hidden="true" />,
    Options: <Settings className="mr-3" aria-hidden="true" />,
  };

  const menuItemsWithIcons = items.map((item) => ({
    ...item,
    icon: item.icon || iconMap[item.key],
  }));

  const handleFocusChange = (index) =>
    updateData((prev) => ({
      ...prev,
                  item={item}
    }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            <p className="text-white/70">Use ↑/↓ and Enter or click any option</p>
          </div>
        </Card>

        <Card className="min-h-[320px]">
          <SectionTitle>Menu</SectionTitle>
          <MenuProvider
            id="main-menu"
            items={menuItemsWithIcons}
            initialFocus={focusIndex}
            active={isActive}
            onFocusChange={handleFocusChange}
            enableLogging
          >
            <MenuList
              itemRenderer={(item, index) => (
                <MenuOption
                  key={item.id}
                  item={{ ...item, icon: item.icon || iconMap[item.key] }}
                  index={index}
                />
              )}
            />
          </MenuProvider>
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
