# Project Status

## Snapshot
- End-to-end player flow from landing through match preview is playable with forward navigation and backtracking between steps.
- Canvas-driven match preview runs at a fixed 120 Hz simulation loop with keyboard and gamepad controls, dash/jump/attack actions, and a difficulty-scaled NPC opponent.
- Fighters, stages, and default match settings are centralized for consistent menu and configuration defaults.
- Outstanding work is tracked for testing coverage, advanced combat systems, effects, replay, customization, story, and online play.

## Current UI Flow
- Landing → Main Menu (keyboard navigable) → Match setup (Start Config) → Fighter selection → Stage selection → Match Preview.
- Back navigation returns to the previous step at each screen; exiting the preview returns players to the Main Menu.

## Match Preview Capabilities
- Uses a fixed-timestep canvas simulation with tuned physics for gravity, run speed, air/ground acceleration, dash timing, jump buffering/coyote time, and wall slide/wall jump behaviors.
- Player 1 supports keyboard and gamepad input for movement, buffered jumps, dashes with cooldowns, and jab attacks; the NPC opponent uses AI that reacts based on difficulty, spacing, and grounded state.
- Canvas rendering draws fighters, sparks, hit/hurt boxes, and a HUD showing names, HP bars, and timer. UI controls support pausing/resuming and exiting, with on-screen control hints and noted gamepad support.

## Scene & Canvas Runtime
- A new SceneManager + InputController stack drives canvas content with registered scenes (e.g., match preview, pause overlays), centralized key/gamepad actions, fixed-step timing, and shared environment settings like floor height and stage metadata.
- Scenes can be pushed/popped for menu overlays or future environments, while shared HUD callbacks keep React UI in sync with canvas state for richer menus and interactive contexts.
- A shared EntityStore registers base player/NPC/item types, supports tagged lookups, snapshots, and hydration, and is injected into scenes so canvas logic can manage combatants and items through a consistent API.
- Scenes now declare an explicit initialize hook that runs before `onEnter`, allowing heavy setup (entity creation, environment wiring, async prep) to complete before updates/rendering begin, while logging initialization outcomes through the manager.

## Game Data Readiness
- Six fighters and four stages are defined with style/environment metadata for selection menus.
- Default configuration sets three rounds, a 99-second timer, Normal difficulty, and keyboard control defaults; menu items are predefined for the main menu.

## Open Work
- Planned improvements include unit and integration tests, special moves, combo system, sound effects, particle effects, replay system, character customization, story mode, and online multiplayer.
