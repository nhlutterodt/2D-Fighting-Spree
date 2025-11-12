import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable SectionTitle component for section headers
 * Enhanced with semantic HTML and accessibility
 */
const SectionTitle = ({ children, className = "", as: Component = "h3" }) => {
  return (
    <Component className={`text-sm uppercase tracking-widest text-white/60 mb-2 ${className}`}>
      {children}
    </Component>
  );
};

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

export default SectionTitle;
