const SAVE_KEY = "tangomu-save-v1";

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
  reactionHistory: [],
  reactionHistorySequence: 0,
  reactionCounts: {},
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

    return {
      ...DEFAULT_SAVE,
      ...data,

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

      reactionHistory: Array.isArray(data.reactionHistory)
        ? data.reactionHistory
            .filter(
              (entry) =>
                entry &&
                Number.isSafeInteger(entry.sequence) &&
                entry.sequence > 0 &&
                Number.isSafeInteger(entry.reactionId) &&
                entry.reactionId >= 1 &&
                entry.reactionId <= 24
            )
            .slice(-10)
        : [],

      reactionHistorySequence:
        Number.isSafeInteger(data.reactionHistorySequence) &&
        data.reactionHistorySequence >= 0
          ? data.reactionHistorySequence
          : 0,

      reactionCounts: loadReactionCounts(data),

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
        entry.reactionId <= 24
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
