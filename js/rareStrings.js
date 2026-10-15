// ========================================
// シークレット一覧
// ========================================

export const rareStrings = [
  { text: "itta", display: "いった", number: 1, color: "normal" },
  { text: "yontenn", display: "よんてん", number: 2, color: "normal" },
  { text: "waga", display: "わが", number: 3, color: "normal" },
  { text: "sattin", display: "さっちん", number: 4, color: "normal" },
  { text: "kinade", display: "きなで", number: 5, color: "normal" },
  { text: "reoneko", display: "れおねこ", number: 6, color: "normal" },
  { text: "oreo", display: "おれお", number: 7, color: "normal" },
  { text: "shio", display: "しお", number: 8, color: "normal" },
  { text: "eete", display: "eete", number: 9, color: "purple" },
  { text: "tangomu", display: "たんごむ", number: 10, color: "gold" },
];

// ========================================
// レア文字列抽選
// ========================================

export function drawRareString(dopaChanceActive = false) {
  const roll = Math.floor(Math.random() * 300000);

  const multiplier = dopaChanceActive ? 10 : 1;

  if (roll < 240 * multiplier) {
    return rareStrings[
      Math.floor(roll / (30 * multiplier))
    ];
  }

  if (roll < 250 * multiplier) {
    return rareStrings[8];
  }

  if (roll < 253 * multiplier) {
    return rareStrings[9];
  }

  return null;
}
