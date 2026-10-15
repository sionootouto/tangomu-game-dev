import { target } from "./config.js";

// ========================================
// 通常の文字シャッフル
// ========================================

export function shuffledCopy() {
  const array = ["t", "a", "n", "g", "o", "m", "u"];

  let result;

  do {
    result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  } while (result.join("") === target);

  return result;
}

// ========================================
// たんごむチャンスの文字順を決める
// ========================================

export function createChanceLetters(
  dopaChanceActive = false,
  dopaTangomuRate = 1 / 3
) {
  const result = ["g", "o", "m", "u"];

  // 文字をランダムに並べ替える
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  // DOPA CHANCE中でなければ通常の順番抽選
  if (!dopaChanceActive) {
    return result;
  }

  // DOPA CHANCE中は1/3の確率で「gomu」を完成させる
  if (Math.random() < dopaTangomuRate) {
    return ["g", "o", "m", "u"];
  }

  // 成功しない場合、「gomu」の並びになっていたら崩す
  if (result.join("") === "gomu") {
    [result[0], result[1]] = [result[1], result[0]];
  }

  return result;
}
