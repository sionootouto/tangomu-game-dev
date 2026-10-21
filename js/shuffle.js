import { target } from "./config.js";

// ========================================
// 通常の文字シャッフル
// ========================================

export function shuffledCopy() {
  const array = ["t", "a", "n", "g", "o", "m", "u"];
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// ========================================
// たんごむチャンスの文字順を決める
// ========================================

export function createChanceLetters(
  dopaChanceActive = false,
  chanceSuccessRate,
  guaranteedLetterCount = 3
) {
  const result = target.slice(guaranteedLetterCount).split("");

  // 文字をランダムに並べ替える
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  const correctLetters = target
    .slice(guaranteedLetterCount)
    .split("");
  const correctString = correctLetters.join("");
  const baseSuccessRate = 1 / factorial(result.length);
  const targetSuccessRate =
    chanceSuccessRate ??
    (dopaChanceActive ? 1 / 3 : baseSuccessRate);

  if (dopaChanceActive) {
    if (Math.random() < targetSuccessRate) {
      return correctLetters;
    }

    // 失敗時に、ランダム順が偶然正解になるのを防ぐ。
    if (result.length > 1 && result.join("") === correctString) {
      [result[0], result[1]] = [result[1], result[0]];
    }

    return result;
  }

  if (
    targetSuccessRate > baseSuccessRate &&
    result.join("") !== correctString
  ) {
    const additionalSuccessRate =
      (targetSuccessRate - baseSuccessRate) /
      (1 - baseSuccessRate);

    if (Math.random() < additionalSuccessRate) {
      return correctLetters;
    }
  }

  return result;
}

function factorial(value) {
  let result = 1;
  for (let factor = 2; factor <= value; factor++) {
    result *= factor;
  }
  return result;
}
