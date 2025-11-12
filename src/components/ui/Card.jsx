import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Card component for content containers
 * Enhanced with consistent styling and accessibility
 */
const Card = ({ className = "", children, as: Component = "div", ...props }) => {
  return (
    <Component 
      className={`rounded-2xl shadow-xl bg-white/5 backdrop-blur p-6 border border-white/10 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
};

export default Card;
