# 2D Fighting Spree - UI Flow Preview

A modern 2D fighting game UI prototype built with React, featuring smooth animations, responsive controls, and canvas-based gameplay.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Features

- **Complete UI Flow**: Landing → Main Menu → Match Configuration → Fighter Selection → Stage Selection → Live Match Preview
- **Canvas-Based Gameplay**: Real-time 2D fighting mechanics with physics simulation (120Hz fixed timestep)
- **Advanced Movement System**:
  - Responsive ground and air movement
  - Double jump mechanics
  - Wall slide and wall jump
  - Dash with cooldown
  - Coyote time and jump buffering for responsive controls
  - Variable jump height (tap vs hold)
- **Combat System**:
  - Attack with startup, active, and recovery frames
  - Hitboxes and hurtboxes visualization
  - Hitstun and invulnerability frames
  - Hit sparks and knockback
- **AI Opponent**: Difficulty-based NPC with adaptive behavior
- **Gamepad Support**: Full controller support (tested with standard gamepads)
- **Smooth Animations**: Framer Motion for screen transitions
- **Responsive Design**: Works on desktop and tablet devices
- **Modular Architecture**: Clean, maintainable component structure

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/2d-fighting-spree-app.git

# Navigate to project directory
cd 2d-fighting-spree-app

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🛠️ CI/CD

- **GitHub Actions**: `.github/workflows/ci.yml` runs on pushes, pull requests, and manual triggers.
- **Frontend job**: Installs dependencies with `npm ci`, executes the Jest suite in CI mode, and verifies the production build on Node.js 20.
- **Cloud Functions job**: Installs with `npm ci`, lints, and builds the Firebase Functions package on Node.js 22 to match the specified runtime.


## 🎯 Controls

### Keyboard
- **Arrow Keys (← →)**: Move left/right
- **Space**: Jump (tap for short hop, hold for full jump)
- **Shift**: Dash
- **Z**: Attack (jab)

### Gamepad
- **Left Stick**: Movement
- **A/Cross**: Jump
- **B/Circle or X/Square**: Dash
- **Y/Triangle**: Attack

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, etc.)
│   ├── screens/         # Screen components (Landing, MainMenu, etc.)
│   ├── game/            # Game-specific components
│   └── Header.jsx       # App header
├── hooks/               # Custom React hooks
├── types/               # Type definitions (JSDoc)
├── constants/           # Game data and physics constants
├── utils/               # Utility functions
├── game/                # Game engine logic (physics, combat, AI, rendering)
└── App.js               # Main app component
```

## 🏗️ Architecture

The project follows a modular architecture with clear separation of concerns:

- **UI Components**: Reusable, accessible components with consistent styling
- **Screen Components**: Page-level components managing specific flows
- **Game Engine**: Separated physics, combat, AI, and rendering logic
- **Constants**: Centralized game data and tunable parameters
- **Hooks**: Custom hooks for keyboard navigation and game state

## 🎨 Tech Stack

- **React 19.2**: UI framework
- **Framer Motion**: Animation library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Canvas API**: 2D rendering for gameplay
- **PropTypes**: Runtime type checking

## 🔧 Configuration

### Physics Tuning

Edit `src/constants/physics.js` to adjust game feel:

```javascript
export const PHYSICS = {
  GRAVITY: 2600,        // Gravity strength
  MAX_RUN: 380,         // Maximum run speed
  JUMP_VEL: 880,        // Jump velocity
  COYOTE_TIME: 0.12,    // Grace period for jumping after leaving ground
  // ... more parameters
};
```

### Game Data

Edit `src/constants/gameData.js` to modify fighters, stages, and configurations.

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# The build folder will contain the production-ready files
```

## 🚢 Deployment

### GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/2d-fighting-spree-app",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

### Other Platforms

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `build` folder or connect via Git
- **AWS S3**: Upload the `build` folder to an S3 bucket with static hosting

## 🐛 Known Issues

- Jump functionality was fixed by ensuring `lastGrounded` timestamp updates every frame while on ground
- Debug version available at `src/components/screens/MatchPreviewDebug.jsx` for troubleshooting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by classic 2D fighting games
- Built as a UI/UX prototype for fighting game interfaces
- Physics and combat systems designed for responsive, competitive gameplay

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/2d-fighting-spree-app](https://github.com/yourusername/2d-fighting-spree-app)

---

Made with ❤️ and React
