import { GACHA_ITEMS } from "./gachaItems.js";

const SAVE_KEY = "tangomu-save-v1";
// Reaction IDs are 1-24; secret history IDs continue from 25.
export const SECRET_HISTORY_ID_OFFSET = 24;
export const SUKA_HISTORY_ENTRY = "Suka";

const DEFAULT_SAVE = {
  totalShuffles: 0,
  totalClears: 0,
  normalShuffleClears: 0,
  chanceClears: 0,
  clearedWithin100Shuffles: false,
  coins: 0,
  chanceUpgradeLevel: 0,
  chanceGuaranteedLettersLevel: 0,
  chanceTypeUpgradeLevel: 0,
  dopaSkillUnlocked: false,
  dopaSkillUpgradeLevel: 0,
  dopaSkillLastUsedAt: 0,
  totalDopaChances: 0,
  totalGachaDraws: 0,
  reactionHistory: [],
  shuffleHistory: [],
  reactionHistorySequence: 0,
  reactionCounts: {},
  gachaItems: Object.fromEntries(
    GACHA_ITEMS.map((item) => [item.id, 0])
  ),
  discoveredSecrets: [],
  unlockedAchievements: []
};

// セーブデータを読み込む
export function loadSave() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return { ...DEFAULT_SAVE };
    }

    const data = JSON.parse(saved);
    const reactionHistory = loadReactionHistory(data);
    const saveData = { ...data };
    delete saveData.reactionAndSecretHistory;

    return {
      ...DEFAULT_SAVE,
      ...saveData,

      totalShuffles:
        Number.isSafeInteger(data.totalShuffles) &&
        data.totalShuffles >= 0
          ? data.totalShuffles
          : 0,

      totalClears:
        Number.isSafeInteger(data.totalClears) &&
        data.totalClears >= 0
          ? data.totalClears
          : 0,

      normalShuffleClears:
        Number.isSafeInteger(data.normalShuffleClears) &&
        data.normalShuffleClears >= 0
          ? data.normalShuffleClears
          : 0,

      chanceClears:
        Number.isSafeInteger(data.chanceClears) &&
        data.chanceClears >= 0
          ? data.chanceClears
          : 0,

      clearedWithin100Shuffles: data.clearedWithin100Shuffles === true,

      coins:
        Number.isSafeInteger(data.coins) &&
        data.coins >= 0
          ? data.coins
          : 0,

      chanceUpgradeLevel:
        Number.isSafeInteger(data.chanceUpgradeLevel) &&
        data.chanceUpgradeLevel >= 0 &&
        data.chanceUpgradeLevel <= 6
          ? data.chanceUpgradeLevel
          : 0,

      chanceGuaranteedLettersLevel:
        Number.isSafeInteger(data.chanceGuaranteedLettersLevel) &&
        data.chanceGuaranteedLettersLevel >= 0 &&
        data.chanceGuaranteedLettersLevel <= 2
          ? data.chanceGuaranteedLettersLevel
          : 0,

      chanceTypeUpgradeLevel:
        Number.isSafeInteger(data.chanceTypeUpgradeLevel) &&
        data.chanceTypeUpgradeLevel >= 0 &&
        data.chanceTypeUpgradeLevel <= 2
          ? data.chanceTypeUpgradeLevel
          : 0,

      dopaSkillUnlocked: data.dopaSkillUnlocked === true,

      dopaSkillUpgradeLevel:
        Number.isSafeInteger(data.dopaSkillUpgradeLevel) &&
        data.dopaSkillUpgradeLevel >= 0 &&
        data.dopaSkillUpgradeLevel <= 4
          ? data.dopaSkillUpgradeLevel
          : 0,

      dopaSkillLastUsedAt:
        Number.isSafeInteger(data.dopaSkillLastUsedAt) &&
        data.dopaSkillLastUsedAt >= 0
          ? data.dopaSkillLastUsedAt
          : 0,

      totalDopaChances:
        Number.isSafeInteger(data.totalDopaChances) &&
        data.totalDopaChances >= 0
          ? data.totalDopaChances
          : 0,

      totalGachaDraws:
        Number.isSafeInteger(data.totalGachaDraws) &&
        data.totalGachaDraws >= 0
          ? data.totalGachaDraws
          : 0,

      reactionHistory,

      shuffleHistory: loadShuffleHistory(data, reactionHistory),

      reactionHistorySequence:
        Number.isSafeInteger(data.reactionHistorySequence) &&
        data.reactionHistorySequence >= 0
          ? data.reactionHistorySequence
          : reactionHistory.reduce(
              (sequence, entry) => Math.max(sequence, entry.sequence),
              0
            ),

      reactionCounts: loadReactionCounts({ ...data, reactionHistory }),

      gachaItems: loadGachaItems(data.gachaItems),

      discoveredSecrets: Array.isArray(data.discoveredSecrets)
        ? data.discoveredSecrets.filter(
            (value) => typeof value === "string"
          )
        : [],

      unlockedAchievements: Array.isArray(data.unlockedAchievements)
        ? data.unlockedAchievements.filter(
            (value) => typeof value === "string"
          )
        : []
    };
  } catch (error) {
    console.error("セーブデータを読み込めませんでした", error);
    return { ...DEFAULT_SAVE };
  }
}

function loadShuffleHistory(data, reactionHistory) {
  const history = Array.isArray(data.shuffleHistory)
    ? data.shuffleHistory
    : Array.isArray(data.reactionAndSecretHistory)
      ? data.reactionAndSecretHistory
      : reactionHistory.map((entry) =>
          Number.isSafeInteger(entry.reactionId)
            ? entry.reactionId
            : SECRET_HISTORY_ID_OFFSET + entry.secretNumber
        );

  return history
    .filter(
      (entry) =>
        entry === SUKA_HISTORY_ENTRY ||
        (Number.isSafeInteger(entry) &&
          entry >= 1 &&
          entry <= SECRET_HISTORY_ID_OFFSET + 10)
    )
    .slice(-10);
}

function loadGachaItems(data) {
  return Object.fromEntries(
    GACHA_ITEMS.map((item) => {
      const count = data?.[item.id];
      return [
        item.id,
        Number.isSafeInteger(count) && count >= 0 ? count : 0
      ];
    })
  );
}

function loadReactionHistory(data) {
  return Array.isArray(data.reactionHistory)
    ? data.reactionHistory
        .map((entry, index) => {
          if (
            !Number.isSafeInteger(entry) ||
            entry < 1 ||
            entry > SECRET_HISTORY_ID_OFFSET + 10
          ) {
            return entry;
          }

          return entry <= SECRET_HISTORY_ID_OFFSET
            ? { sequence: index + 1, reactionId: entry }
            : {
                sequence: index + 1,
                secretNumber: entry - SECRET_HISTORY_ID_OFFSET
              };
        })
        .filter(
          (entry) =>
            entry &&
            Number.isSafeInteger(entry.sequence) &&
            entry.sequence > 0 &&
            ((Number.isSafeInteger(entry.reactionId) &&
              entry.reactionId >= 1 &&
              entry.reactionId <= SECRET_HISTORY_ID_OFFSET) ||
              (Number.isSafeInteger(entry.secretNumber) &&
                entry.secretNumber >= 1 &&
                entry.secretNumber <= 10))
        )
        .slice(-10)
    : [];
}

function loadReactionCounts(data) {
  const counts = Object.fromEntries(
    Array.from({ length: 24 }, (_, index) => [index + 1, 0])
  );

  if (
    data.reactionCounts &&
    typeof data.reactionCounts === "object" &&
    !Array.isArray(data.reactionCounts)
  ) {
    for (let reactionId = 1; reactionId <= 24; reactionId++) {
      const count = data.reactionCounts[reactionId];
      if (Number.isSafeInteger(count) && count >= 0) {
        counts[reactionId] = count;
      }
    }
    return counts;
  }

  if (Array.isArray(data.reactionHistory)) {
    data.reactionHistory.forEach((entry) => {
      if (
        entry &&
        Number.isSafeInteger(entry.reactionId) &&
        entry.reactionId >= 1 &&
        entry.reactionId <= SECRET_HISTORY_ID_OFFSET
      ) {
        counts[entry.reactionId]++;
      }
    });
  }

  return counts;
}

// 保存する
export function saveGame(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("セーブデータを保存できませんでした", error);
    return false;
  }
}

// セーブデータを削除する
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
