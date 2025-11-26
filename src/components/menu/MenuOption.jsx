import React, { useMemo } from 'react';
import { Button } from '../ui';
import { useMenu } from './MenuProvider';

const MenuOption = ({ item, index }) => {
  const { focusIndex, setFocusIndex, activate } = useMenu();
  const isFocused = focusIndex === index;

  const ariaLabel = useMemo(() => {
    const label = item.key || item.label || `item-${index}`;
    return item.disabled ? `${label} (disabled)` : label;
  }, [index, item]);

  const icon = typeof item.icon === 'function' ? item.icon(isFocused) : item.icon;

  const handleClick = () => {
    setFocusIndex(index);
    activate(index);
  };

  return (
    <Button
      key={item.id || item.key || index}
      onClick={handleClick}
      disabled={item.disabled}
      variant={isFocused ? 'primary' : 'ghost'}
      className={`justify-start ${isFocused ? 'ring-2 ring-indigo-400' : ''}`}
      ariaLabel={ariaLabel}
    >
      {icon}
      <div className="flex flex-col text-left">
        <span className="font-semibold leading-tight">{item.label || item.key}</span>
        {item.description && (
          <span className="text-xs text-white/60 leading-tight">{item.description}</span>
        )}
      </div>
    </Button>
  );
};

export default React.memo(MenuOption);
