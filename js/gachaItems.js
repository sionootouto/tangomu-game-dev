export const GACHA_ITEMS = [
  { id: "chopsticks", 
    name: "割り箸", 
    icon: "🥢",
    image: "./image/chopsticks.png",
    ability: "能力なし"
  },
  {
    id: "energyDrink",
    name: "エナジードリンク",
    icon: "🥤",
    image: "./image/energydrink.png",
    ability: "所持数1個ごとに、たんごむチャンスの発生率が1.1倍（最大1.5倍）"
  },
  {
    id: "tennisGrip",
    name: "テニスグリップ",
    icon: "🎾",
    image: "./image/grip.png",
    ability: "所持数1個ごとに、チャンス成功率+5ポイント（最大+30ポイント）"
  },
  {
    id: "poultice",
    name: "湿布",
    icon: "🩹",
    image: "./image/poultice.png",
    ability: "所持数1個ごとに、DOPA CHANCEの初期時間+5秒（最大+60秒）"
  },
  {
    id: "waterBottle",
    name: "2Lペットボトルの水",
    icon: "💧",
    image: "./image/water.png",
    ability: "所持数1個につき20秒間停止（効果最大10個・200秒）。クールタイム3分"
  },
  {
    id: "parkingTicket",
    name: "駐車券",
    icon: "🅿️",
    image: "./image/parkingticket.png",
    ability: "シャッフルごとに追加カウントを抽選。（効果最大10個）"
  },
  {
    id: "famichiki",
    name: "ファミチキ",
    icon: "🍟",
    image: "./image/famichiki.png",
    ability: "所持数1個ごとにシークレット出現率2倍（最大10倍）"
  },
  {
    id: "twoyen",
    name: "2円",
    icon: "🪙",
    image: "./image/2yen.png",
    ability: "所持数1個ごとに、シャッフルごとの2コイン獲得率+5%（最大80%）"
  },
  {
    id: "ipad",
    name: "iPad",
    icon: "📱",
    image: "./image/ipad.png",
    ability: "30秒間自動シャッフル（クールタイム3分）。（効果最大6個・約0.029秒ごとに1回）"
  },
];

export const SUCCESS_GACHA_ITEMS = GACHA_ITEMS.slice(1);
