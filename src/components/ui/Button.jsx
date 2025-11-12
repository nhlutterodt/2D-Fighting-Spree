import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Button component with multiple variants
 * Enhanced with accessibility features and proper prop validation
 */
const Button = ({ 
  className = "", 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary",
  type = "button",
  ariaLabel,
  ...props 
}) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-400",
    ghost: "bg-transparent hover:bg-white/10 text-white border border-white/10 focus:ring-white/30",
    danger: "bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white focus:ring-zinc-600",
  };
  
  const variantClass = variants[variant] || variants.primary;
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled} 
      className={`${base} ${variantClass} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'ghost', 'danger', 'secondary']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  ariaLabel: PropTypes.string,
};

export default Button;
