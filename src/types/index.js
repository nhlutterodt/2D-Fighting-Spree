/**
 * Type definitions for the 2D Fighter game
 * Using JSDoc for type checking in JavaScript
 */

/**
 * @typedef {'Landing' | 'MainMenu' | 'Start_Config' | 'Start_Fighter' | 'Start_Stage' | 'Start_Preview'} ScreenId
 */

/**
 * @typedef {Object} Screen
 * @property {ScreenId} id - The screen identifier
 */

/**
 * @typedef {'Easy' | 'Normal' | 'Hard'} Difficulty
 */

/**
 * @typedef {'Keyboard' | 'Gamepad' | 'AI'} ControlType
 */

/**
 * @typedef {Object} MatchConfig
 * @property {number} rounds - Best of X rounds
 * @property {number} timeLimit - Seconds per round
 * @property {Difficulty} difficulty - AI difficulty level
 * @property {ControlType} control - Player 1 control method
 */

/**
 * @typedef {Object} Fighter
 * @property {string} id - Fighter identifier
 * @property {string} style - Fighting style
 * @property {number} speed - Speed stat (1-10)
 * @property {number} power - Power stat (1-10)
 */

/**
 * @typedef {Object} Stage
 * @property {string} id - Stage identifier
 * @property {string} env - Environment type
 * @property {number} friction - Friction coefficient (0-1)
 */

/**
 * @typedef {Object} Body
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} vx - X velocity
 * @property {number} vy - Y velocity
 * @property {number} w - Width
 * @property {number} h - Height
 * @property {1 | -1} facing - Direction facing
 * @property {string} color - Body color
 * @property {number} hp - Health points
 * @property {boolean} grounded - Is on ground
 * @property {number} lastGrounded - Last time grounded
 * @property {number | null} jumpBufferedAt - Jump buffer timestamp
 * @property {number} jumpsLeft - Remaining jumps
 * @property {boolean} dashing - Is dashing
 * @property {number} dashT - Dash timer
 * @property {number} dashCD - Dash cooldown
 * @property {boolean} wallSlide - Is wall sliding
 * @property {1 | -1 | 0} wallNormal - Wall normal direction
 * @property {number} hitstunT - Hitstun timer
 * @property {number} invulnT - Invulnerability timer
 * @property {number} attackT - Attack timer
 * @property {Spark | null} [spark] - Hit spark effect
 */

/**
 * @typedef {Object} Spark
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} t - Time remaining
 */

/**
 * @typedef {Object} GamepadInput
 * @property {number} axisX - X axis value
 * @property {boolean} btnJump - Jump button pressed
 * @property {boolean} btnDash - Dash button pressed
 * @property {boolean} btnAtk - Attack button pressed
 */

export {};
