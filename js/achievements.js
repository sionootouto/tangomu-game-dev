// 実績一覧
export const achievements = [
  {
    id: "first_shuffle",
    name: "初めてのシャッフル",
    description: "シャッフルを1回行う。",
    condition: (saveData) => saveData.totalShuffles >= 1
  },
  {
    id: "shuffle_master",
    name: "シャッフル職人",
    description: "累計100回シャッフルする。",
    condition: (saveData) => saveData.totalShuffles >= 100
  },
  {
    id: "true_tangomu",
    name: "真のたんごむ",
    description: "通常プレイで初めてクリアする。",
    condition: (saveData) => saveData.totalClears >= 1
  },
  {
    id: "secret_finder",
    name: "秘密の発見者",
    description: "シークレットを初めて発見する。",
    condition: (saveData) => saveData.discoveredSecrets.length >= 1
  },
  {
    id: "dopa_chance_first",
    name: "はじめてのどぱちゃんす",
    description: "DOPA CHANCEを初めて発生させる。",
    condition: (saveData) => saveData.totalDopaChances >= 1
  }
];

// 条件を満たした未解除の実績を解除する
export function checkAchievements(saveData) {
  const newlyUnlocked = [];

  for (const achievement of achievements) {
    const alreadyUnlocked =
      saveData.unlockedAchievements.includes(achievement.id);

    if (!alreadyUnlocked && achievement.condition(saveData)) {
      saveData.unlockedAchievements.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
