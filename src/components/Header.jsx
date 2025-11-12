import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, Sparkles } from 'lucide-react';
import Button from './ui/Button';

/**
 * Header component with back navigation
 * Enhanced with proper accessibility and semantic HTML
 */
const Header = ({ onBack }) => {
  return (
    <header className="flex items-center justify-between mb-4" role="banner">
      <div className="flex items-center gap-3">
        <Sparkles className="opacity-70" aria-hidden="true" />
        <div>
          <div className="text-xs uppercase tracking-widest text-white/60">Prototype</div>
          <h1 className="text-xl md:text-2xl font-bold">2D Fighter - UI Flow Preview</h1>
        </div>
      </div>
      <Button 
        variant="ghost" 
        onClick={onBack}
        ariaLabel="Go back to previous screen"
      >
        <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" /> 
        Back
      </Button>
    </header>
  );
};

Header.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default Header;
