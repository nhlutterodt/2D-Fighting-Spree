import React from 'react';
import { useMenu } from './MenuProvider';
import MenuOption from './MenuOption';

/**
 * MenuList renders a stack of menu options using context-provided items.
 * It accepts a render prop so menus can customize their look without
 * reinventing focus/activation wiring.
 */
const MenuList = ({ className = '', itemRenderer }) => {
  const { items } = useMenu();

  return (
    <nav className={className} role="navigation" aria-label="Menu">
      <div className="flex flex-col gap-3">
        {items.map((item, index) =>
          itemRenderer ? (
            itemRenderer(item, index)
          ) : (
            <MenuOption key={item.id || item.key || index} item={item} index={index} />
          )
        )}
      </div>
    </nav>
  );
};

export default MenuList;
