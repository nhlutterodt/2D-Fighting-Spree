# 2D Fighter - Modular Project Structure

This document describes the refactored, modular architecture of the 2D Fighting Game UI prototype.

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx   # Enhanced button with variants
│   │   ├── Card.jsx     # Container card component
│   │   ├── SectionTitle.jsx  # Section header component
│   │   └── index.js     # Barrel export
│   ├── screens/         # Screen/page components
│   │   ├── Landing.jsx          # Landing screen
│   │   ├── MainMenu.jsx         # Main menu with keyboard nav
│   │   ├── StartConfig.jsx      # Match configuration
│   │   ├── FighterSelect.jsx    # Fighter selection
│   │   ├── StageSelect.jsx      # Stage selection
│   │   ├── MatchPreview.jsx     # Game canvas & simulation
│   │   └── index.js             # Barrel export
│   ├── Header.jsx       # App header with navigation
│   └── FighterApp.jsx   # Main app component
├── game/                # Game engine modules
│   ├── rendering.js     # Canvas rendering utilities
│   ├── physics.js       # Physics & movement logic
│   ├── combat.js        # Combat & attack system
│   └── ai.js           # NPC AI behavior
├── hooks/               # Custom React hooks
│   └── useKeyboardNavigation.js  # Keyboard menu navigation
├── constants/           # Game data & configuration
│   ├── gameData.js      # Fighters, stages, defaults
│   └── physics.js       # Physics constants & tuning
├── utils/               # Utility functions
│   └── helpers.js       # Math, collision, input helpers
├── types/               # Type definitions (JSDoc)
│   └── index.js         # Type definitions
├── App.js              # Root component
└── index.css           # Global styles with Tailwind
```

## 🎯 Key Improvements

### 1. **Modular Component Architecture**
- Separated monolithic component into focused, single-responsibility modules
- Each component has clear props and PropTypes validation
- Barrel exports for clean imports

### 2. **Enhanced UI Components**
- **Button**: Multiple variants (primary, ghost, danger, secondary)
- **Card**: Flexible container with consistent styling
- **SectionTitle**: Semantic heading component
- All components include accessibility features (ARIA labels, focus management)

### 3. **Separated Game Engine**
- **rendering.js**: All canvas drawing logic
- **physics.js**: Movement, jumping, dashing, wall mechanics
- **combat.js**: Attack system, hitboxes, damage calculation
- **ai.js**: NPC behavior and difficulty scaling

### 4. **Custom Hooks**
- **useKeyboardNavigation**: Reusable keyboard menu navigation
- Proper cleanup and event handling

### 5. **Constants & Configuration**
- Centralized game data (fighters, stages)
- Tunable physics parameters
- Easy difficulty balancing

### 6. **Accessibility Enhancements**
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management

### 7. **Code Quality**
- JSDoc documentation throughout
- PropTypes validation
- Consistent naming conventions
- Clear separation of concerns

## 🚀 Usage

### Running the Application

```bash
npm install
npm start
```

### Adding a New Fighter

Edit `src/constants/gameData.js`:

```javascript
export const fighters = [
  // ... existing fighters
  { id: "NewFighter", style: "Assassin", speed: 9, power: 7 },
];
```

### Adding a New Stage

Edit `src/constants/gameData.js`:

```javascript
export const stages = [
  // ... existing stages
  { id: "New Arena", env: "Lava", friction: 0.7 },
];
```

### Tuning Physics

Edit `src/constants/physics.js`:

```javascript
export const PHYSICS = {
  GRAVITY: 2600,        // Adjust gravity
  MAX_RUN: 380,         // Adjust run speed
  JUMP_VEL: 880,        // Adjust jump height
  // ... other parameters
};
```

### Creating a New Screen

1. Create component in `src/components/screens/`
2. Add to barrel export in `src/components/screens/index.js`
3. Add screen logic to `src/components/FighterApp.jsx`

## 🎮 Game Controls

- **← →**: Move left/right
- **Space**: Jump (tap for short hop, hold for full jump)
- **Shift**: Dash
- **Z**: Attack (jab)
- **Gamepad**: Left stick + A/B/Y buttons

## 🔧 Technical Features

### Physics System
- Fixed timestep simulation (120 Hz)
- Coyote time for forgiving jumps
- Jump buffering
- Double jump
- Wall slide & wall jump
- Dash with cooldown

### Combat System
- Startup/active/recovery frames
- Hitbox/hurtbox collision
- Hitstun and invulnerability
- Knockback physics
- Visual hit sparks

### AI System
- Difficulty-based reaction times
- Distance-based behavior
- Random movement and attacks
- Adaptive to player position

## 📦 Dependencies

- **react**: UI framework
- **framer-motion**: Animations
- **lucide-react**: Icons
- **tailwindcss**: Styling
- **prop-types**: Runtime type checking

## 🎨 Styling

The project uses Tailwind CSS for styling with a custom dark theme:
- Gradient backgrounds
- Glass-morphism effects
- Consistent spacing and colors
- Responsive design

## 🧪 Testing

Components are structured for easy testing:
- Pure functions in game engine
- Separated logic from rendering
- Clear input/output contracts

## 📝 Future Enhancements

Potential areas for expansion:
- [ ] More fighters and stages
- [ ] Special moves system
- [ ] Combo system
- [ ] Sound effects and music
- [ ] Replay system
- [ ] Online multiplayer
- [ ] Character customization
- [ ] Story mode

## 🤝 Contributing

When adding new features:
1. Follow the existing modular structure
2. Add PropTypes validation
3. Include JSDoc comments
4. Maintain accessibility features
5. Update this documentation

## 📄 License

This is a prototype/demo project for educational purposes.
