const SAVE_KEY = "tangomu-save-v1";

const DEFAULT_SAVE = {
  totalShuffles: 0,
  totalClears: 0,
  totalDopaChances: 0,
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

      totalDopaChances:
        Number.isSafeInteger(data.totalDopaChances) &&
        data.totalDopaChances >= 0
          ? data.totalDopaChances
          : 0,

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
