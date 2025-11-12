# Contributing to 2D Fighting Spree

First off, thank you for considering contributing to 2D Fighting Spree! It's people like you that make this project better.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots, etc.)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternative solutions** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/2d-fighting-spree-app.git

# Navigate to directory
cd 2d-fighting-spree-app

# Install dependencies
npm install

# Start development server
npm start
```

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Follow the existing code style (ESLint configuration)
- Write meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### File Organization

- Place reusable UI components in `src/components/ui/`
- Place screen components in `src/components/screens/`
- Place game logic in `src/game/`
- Place constants in `src/constants/`
- Place utilities in `src/utils/`

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Examples:
```
Add double jump mechanic
Fix jump timing issue with coyote time
Update README with new controls
Refactor physics constants into separate file
```

### Component Structure

```javascript
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component description
 */
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  );
};

MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default MyComponent;
```

## Testing

- Test your changes in multiple browsers (Chrome, Firefox, Safari)
- Test keyboard and gamepad controls
- Verify responsive design on different screen sizes
- Check for console errors and warnings

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Update inline comments for complex logic
- Create or update relevant documentation files

## Areas for Contribution

### High Priority
- Additional fighters with unique movesets
- More stages with different physics properties
- Sound effects and music
- Combo system
- Special moves and super attacks

### Medium Priority
- Online multiplayer support
- Replay system
- Training mode
- Character customization
- Achievement system

### Low Priority
- Mobile touch controls
- Additional game modes
- Spectator mode
- Tournament bracket system

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
