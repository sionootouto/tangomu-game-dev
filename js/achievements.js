
/*
 * 実績の公開方式
 *
 * normal        : 未解除でも名前・説明を表示
 * nameOnly      : 未解除では名前だけ表示
 * conditionOnly : 未解除では説明だけ表示
 * secret        : 未解除では名前も隠す
 */

import { SECRET_HISTORY_ID_OFFSET } from "./save.js";

// ========================================
// 実績一覧
// ========================================

function getReactionAndSecretHistory(saveData) {
  if (Array.isArray(saveData.reactionAndSecretHistory)) {
    return saveData.reactionAndSecretHistory.filter(
      (id) =>
        Number.isSafeInteger(id) &&
        id >= 1 &&
        id <= SECRET_HISTORY_ID_OFFSET + 10
    );
  }

  return Array.isArray(saveData.reactionHistory)
    ? saveData.reactionHistory
        .filter(
          (entry) =>
            entry &&
            Number.isSafeInteger(entry.sequence) &&
            ((Number.isSafeInteger(entry.reactionId) &&
              entry.reactionId >= 1 &&
              entry.reactionId <= SECRET_HISTORY_ID_OFFSET) ||
              (Number.isSafeInteger(entry.secretNumber) &&
                entry.secretNumber >= 1 &&
                entry.secretNumber <= 10))
        )
        .map((entry) =>
          Number.isSafeInteger(entry.reactionId)
            ? entry.reactionId
            : SECRET_HISTORY_ID_OFFSET + entry.secretNumber
        )
    : [];
}

export const achievements = [
  {
    id: "shuffle_akagingokyu",
    name: "シャッフル赤銀五級",
    description: "シャッフルを1回行う。",
    visibility: "normal",
    condition: (saveData) => saveData.totalShuffles >= 1
  },
  {
    id: "shuffle_akaginjudan",
    name: "シャッフル赤銀十段",
    description: "累計100回シャッフルする。",
    visibility: "normal",
    condition: (saveData) => saveData.totalShuffles >= 100
  },
  {
    id: "shuffle_akakinkurouro",
    name: "シャッフル赤銀玄人",
    description: "累計1000回シャッフルする。",
    visibility: "conditionOnly",
    condition: (saveData) => saveData.totalShuffles >= 1000
  },
  {
    id: "shuffle_kinkintyouzin",
    name: "シャッフル金金超人",
    description: "累計10000回シャッフルする。",
    visibility: "conditionOnly",
    condition: (saveData) => saveData.totalShuffles >= 10000
  },
  {
    id: "shuffle_akagintatuzin",
    name: "シャッフル赤銀達人",
    description: "累計50000回シャッフルする。",
    visibility: "secret",
    condition: (saveData) => saveData.totalShuffles >= 50000
  },
  {
    id: "shuffle_kinnizitatuzin",
    name: "シャッフル金虹達人",
    description: "累計100000回シャッフルする。",
    visibility: "secret",
    condition: (saveData) => saveData.totalShuffles >= 100000
  },
  {
    id: "first_tangomu",
    name: "はじめてのたんごむ",
    description: "初めてたんごむを揃える。",
    visibility: "normal",
    condition: (saveData) => saveData.totalClears >= 1
  },
  {
    id: "tangomu_beteran",
    name: "たんごむのベテラン",
    description: "累計10回たんごむを揃える。",
    visibility: "conditionOnly",
    condition: (saveData) => saveData.totalClears >= 10
  },
  {
    id: "tangomu_master",
    name: "たんごむマスター",
    description: "累計100回たんごむを揃える。",
    visibility: "secret",
    condition: (saveData) => saveData.totalClears >= 100
  },
  {
    id: "tangomu_god",
    name: "たんごむの神",
    description: "累計1000回たんごむを揃える。",
    visibility: "secret",
    condition: (saveData) => saveData.totalClears >= 1000
  },
  {
    id: "wild_tangomu",
    name: "野生のたんごむ",
    description: "通常シャッフルでたんごむを揃える。",
    visibility: "normal",
    condition: (saveData) => saveData.normalShuffleClears >= 1
  },
  {
    id: "friends_distance",
    name: "友達の距離感",
    description: "シャッフル100回以内でたんごむを揃える。",
    visibility: "conditionOnly",
    condition: (saveData) => saveData.clearedWithin100Shuffles === true
  },
  {
    id: "Donder_distance",
    name: "ドンだーの距離感",
    description: "シャッフル50回以内でたんごむを揃える。",
    visibility: "secret",
    condition: (saveData) => saveData.clearedWithin50Shuffles === true
  },
  {
    id: "lovers_distance",
    name: "恋人の距離感",
    description: "シャッフル10回以内でたんごむを揃える。",
    visibility: "secret",
    condition: (saveData) => saveData.clearedWithin10Shuffles === true
  },
  {
    id: "good_distance",
    name: "良かったこの距離で",
    description: "「距離感」の実績を全て解除する。",
    visibility: "secret",
    condition: (saveData) => {
      const unlocked = saveData.unlockedAchievements ?? [];
      return [
        "friends_distance",
        "Donder_distance",
        "lovers_distance"
      ].every((achievementId) => unlocked.includes(achievementId));
    }
  },
  {
    id: "secret_finder",
    name: "秘密の発見者",
    description: "シークレットを初めて発見する。",
    visibility: "nameOnly",
    condition: (saveData) =>
      (saveData.discoveredSecrets ?? []).length >= 1
  },
  {
    id: "secret_hunter",
    name: "シークレット・ハンター",
    description: "全てのシークレットを発見する。",
    visibility: "secret",
    condition: (saveData) =>
      (saveData.discoveredSecrets ?? []).length >= 10
  },
  {
    id: "dopattemita",
    name: "ドパってみた",
    description: "DOPA CHANCEを初めて発生させる。",
    visibility: "secret",
    condition: (saveData) => saveData.totalDopaChances >= 1
  },
  {
    id: "doparisugi",
    name: "ドパりすぎ",
    description: "累計10回DOPA CHANCEを発生させる。",
    visibility: "secret",
    condition: (saveData) => saveData.totalDopaChances >= 10
  },
  {
    id: "kimatteru",
    name: "キマってる",
    description: "累計100回DOPA CHANCEを発生させる。",
    visibility: "secret",
    condition: (saveData) => saveData.totalDopaChances >= 100
  },
  {
    id: "jirikiage",
    name: "地力上げ",
    description: "「たんもぐ」を1回引く。",
    visibility: "secret",
    condition: (saveData) =>
      (saveData.reactionCounts?.[16] ?? 0) >= 1
  },
  {
    id: "jirikikoime",
    name: "地力濃いめ",
    description: "「たんもぐ」を累計3回引く。",
    visibility: "secret",
    condition: (saveData) =>
      (saveData.reactionCounts?.[16] ?? 0) >= 5
  },
  {
    id: "goldcard",
    name: "ゴールドカード",
    description: "「たんもぐ」を累計20回引く。",
    visibility: "secret",
    condition: (saveData) =>
      (saveData.reactionCounts?.[16] ?? 0) >= 20
  },
  {
    id: "tangomujackpot",
    name: "たんごむジャックポット",
    description: "「たんごむ」を三連続で引く。",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) =>
          id === 1 &&
          history[index + 1] === 1 &&
          history[index + 2] === 1
      );
    }
  },
  {
    id: "ritsuippatsutsumo",
    name: "立直一発ツモ",
    description: "「たんごうむ」→「たんごむ」の順を引く。",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) => id === 2 && history[index + 1] === 1
      );
    }
  },
  {
    id: "more_DOPA",
    name: "もっとドパっちゃおう",
    description: "「たんぐもう」→「たんごむ」の順を引く。",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) => id === 3 && history[index + 1] === 1
      );
    }
  },
  {
    id: "maybe_spidersense",
    name: "スパイダーセンスあり？",
    description: "「たんぐも」又は「たぬぐも」→「たんごむ」の順を引く。",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) =>
          (id === 5 || id === 24) && history[index + 1] === 1
      );
    }
  },
  {
    id: "shikintatsujin",
    name: "借金達人",
    description: "「たぬもぐ」→「たんごむ」の順を引く。",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) => id === 19 && history[index + 1] === 1
      );
    }
  },
  {
    id: "nidankatsuyou",
    name: "二段活用",
    description: "「たのぐむ」→「たのうぐむ」の順を引く。",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) =>
          (id === 7 || id === 8) && history[index + 1] === 12
      );
    }
  },
  {
    id: "DOPPALganger",
    name: "ドッパルゲンガー",
    description: "「たぬごむ」、「たんごむ」を連続で引く。（順不同）",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) =>
          (id === 23 && history[index + 1] === 1) ||
          (id === 1 && history[index + 1] === 23)
      );
    }
  },
  {
    id: "gengogakusha",
    name: "言語学者？",
    description: "「たんむご」、「たぬむご」を連続で引く。（順不同）",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      return history.some(
        (id, index) =>
          (id === 18 && history[index + 1] === 20) ||
          (id === 20 && history[index + 1] === 18)
      );
    }
  },
  {
    id: "tanshio",
    name: "タン塩",
    description: "「たんごむ」、シークレット8番を連続で引く。（順不同）",
    visibility: "secret",
    condition: (saveData) => {
      const history = getReactionAndSecretHistory(saveData);
      const secret8Id = SECRET_HISTORY_ID_OFFSET + 8;
      return history.some(
        (id, index) =>
          (id === 1 && history[index + 1] === secret8Id) ||
          (id === secret8Id && history[index + 1] === 1)
      );
    }
  },

];

// ========================================
// 条件を満たした未解除の実績を解除する
// ========================================

export function checkAchievements(saveData) {
  const newlyUnlocked = [];

  if (!Array.isArray(saveData.unlockedAchievements)) {
    saveData.unlockedAchievements = [];
  }

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
