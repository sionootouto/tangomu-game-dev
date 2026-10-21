export const target = "tangomu";
export const DEBUG_MODE = false;
export const CHANCE_UPGRADE_RATES = [
  1 / 20,
  1 / 16,
  1 / 13,
  1 / 10,
  1 / 8,
  1 / 6,
];
export const CHANCE_UPGRADE_COSTS = [1, 4, 10, 18, 30];
export const CHANCE = CHANCE_UPGRADE_RATES[0];
export const CHANCE_TYPE_UPGRADE_COSTS = [50, 150];
export const CHANCE_TYPE_UPGRADE_WEIGHTS = {
  normal: 1,
  super: 1 / 3,
  hyper: 1 / 7
};
export const DOPA_SKILL_UNLOCK_COST = 10;
export const DOPA_SKILL_COOLDOWNS = [
  10 * 60 * 1000,
  8 * 60 * 1000,
  6 * 60 * 1000,
  4 * 60 * 1000,
  2 * 60 * 1000
];
export const DOPA_SKILL_UPGRADE_COSTS = [20, 40, 60, 80];
