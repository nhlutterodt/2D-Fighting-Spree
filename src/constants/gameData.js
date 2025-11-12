/**
 * Game data constants
 * Centralized data for fighters, stages, and default configurations
 */

export const fighters = [
  { id: "Rhea", style: "Sword", speed: 7, power: 6 },
  { id: "Kato", style: "Brawler", speed: 5, power: 8 },
  { id: "Miya", style: "Lancer", speed: 8, power: 5 },
  { id: "Dax", style: "Grappler", speed: 4, power: 9 },
  { id: "Vela", style: "Mageblade", speed: 6, power: 6 },
  { id: "Iko", style: "Nunchaku", speed: 9, power: 4 },
];

export const stages = [
  { id: "Dojo Dusk", env: "Wood", friction: 0.9 },
  { id: "Sky Bridge", env: "Metal", friction: 0.8 },
  { id: "Bazaar Night", env: "Stone", friction: 0.85 },
  { id: "Glacier Gate", env: "Ice", friction: 0.6 },
];

export const defaultConfig = {
  rounds: 3,
  timeLimit: 99,
  difficulty: "Normal",
  control: "Keyboard",
};

export const menuItems = [
  { key: "Start", disabled: false },
  { key: "Continue", disabled: true },
  { key: "Load", disabled: true },
  { key: "Options", disabled: true },
];
