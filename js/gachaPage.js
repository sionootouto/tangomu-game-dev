import { GACHA_ITEMS, SUCCESS_GACHA_ITEMS } from "./gachaItems.js";
import { loadSave, saveGame } from "./save.js";
import { checkAchievements } from "./achievements.js";
import { playSE } from "./sounds.js";

const DRAW_COST = 10;
const REVEAL_DELAY = 1250;

const saveData = loadSave();
const coins = document.getElementById("gachaCoins");
const machine = document.querySelector(".gacha-machine");
const stage = document.getElementById("gachaStage");
const stageText = document.getElementById("gachaStageText");
const drawOnceButton = document.getElementById("drawGachaOnce");
const inventory = document.getElementById("gachaInventory");
const status = document.getElementById("gachaStatus");
let isDrawing = false;

export const MESSAGES = {
  chopsticks: "ハズレ。ラーメンでもたんもぐしよう。",
  energyDrink: "当たり！たんさんも喜んでいるよ。",
  tennisGrip: "当たり！これを機に巻き替えてみようか。",
  poultice: "当たり！もはや体の一部。",
  waterBottle: "当たり！ガチ勢の仲間入りかも？",
  parkingTicket: "当たり！ご利用は計画的に。",
  famichiki: "当たり！腹痛にならないといいな。",
  twoyen: "当たり！でも、これで何ができるんだ？",
  ipad: "当たり！とりあえずプロセカするか。",
};

function refresh(newItemIds = []) {
  coins.textContent = String(saveData.coins);
  drawOnceButton.disabled = isDrawing || saveData.coins < DRAW_COST;
  renderInventory(newItemIds);
}

function renderInventory(newItemIds = []) {
  const itemCounts = saveData.gachaItems ?? {};
  inventory.replaceChildren();

  GACHA_ITEMS.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gacha-inventory-card";
    if (newItemIds.includes(item.id)) {
      card.classList.add("new-item");
    }

    const image = document.createElement(item.image ? "img" : "span");
    image.className = item.image
      ? "gacha-item-image"
      : "gacha-item-icon";
    if (item.image) {
      image.src = item.image;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
    } else {
      image.setAttribute("aria-hidden", "true");
      image.textContent = item.icon;
    }

    const name = document.createElement("span");
    name.className = "gacha-item-label";
    name.textContent = item.name;

    const count = document.createElement("strong");
    count.className = "gacha-item-count";
    count.textContent = `${itemCounts[item.id] ?? 0} 個`;

    const ability = document.createElement("small");
    ability.className = "gacha-item-ability";
    ability.textContent = item.ability;

    card.append(image, name, count, ability);
    if (item.id === "chopsticks") {
      const eatButton = document.createElement("button");
      eatButton.className = "eat-chopsticks-button";
      eatButton.type = "button";
      eatButton.textContent = "割り箸を食べる";
      eatButton.disabled = isDrawing || (itemCounts.chopsticks ?? 0) < 1;
      eatButton.addEventListener("click", eatChopsticks);
      card.appendChild(eatButton);
    }
    inventory.appendChild(card);
  });
}

function eatChopsticks() {
  const chopsticksCount = saveData.gachaItems.chopsticks ?? 0;
  if (isDrawing || chopsticksCount < 1) {
    return;
  }

  saveData.gachaItems.chopsticks = chopsticksCount - 1;
  if (!saveGame(saveData)) {
    saveData.gachaItems.chopsticks = chopsticksCount;
    status.textContent = "保存できなかったため、割り箸を食べられませんでした。";
    refresh();
    return;
  }

  status.textContent = "割り箸をね、バリボリ食うのが一番うまいんですわ。";
  playSE("eatingChopsticks");
  refresh();
}

function rollItem() {
  if (Math.random() >= 1 / 5) {
    return GACHA_ITEMS[0];
  }

  return SUCCESS_GACHA_ITEMS[
    Math.floor(Math.random() * SUCCESS_GACHA_ITEMS.length)
  ];
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function setDrawingState(drawing) {
  isDrawing = drawing;
  drawOnceButton.disabled = isDrawing || saveData.coins < DRAW_COST;
}

async function draw() {
  if (saveData.coins < DRAW_COST) {
    status.textContent = "Coinsが足りません。ゲームに戻ってCoinsを集めよう。";
    return;
  }

  const previousCoins = saveData.coins;
  const previousItems = saveData.gachaItems;
  const previousDraws = saveData.totalGachaDraws;
  const item = rollItem();
  const nextItems = { ...saveData.gachaItems };

  saveData.coins -= DRAW_COST;
  saveData.gachaItems = nextItems;
  saveData.totalGachaDraws++;

  if (!saveGame(saveData)) {
    saveData.coins = previousCoins;
    saveData.gachaItems = previousItems;
    saveData.totalGachaDraws = previousDraws;
    status.textContent = "保存できなかったため、ガチャを中止しました。";
    refresh();
    return;
  }

  setDrawingState(true);
  playSE("breakChopsticks");
  stage.classList.remove("breaking");
  stageText.textContent = "うまく割れるか...？";
  status.textContent = "抽選中です…";
  refresh();

  machine.classList.add("breaking");
  stage.classList.remove("breaking");
  void stage.offsetWidth;
  stage.classList.add("breaking");
  await delay(REVEAL_DELAY);

  nextItems[item.id] = (nextItems[item.id] ?? 0) + 1;
  const previousAchievements = [...saveData.unlockedAchievements];
  const newlyUnlocked = checkAchievements(saveData);
  const resultSaved = saveGame(saveData);

  machine.classList.remove("breaking");
  stage.classList.remove("breaking");
  stageText.textContent = MESSAGES[item.id] ?? MESSAGES.default;
  playSE(item.id === "chopsticks" ? "gachaSuka" : "gachaCollect");
  const resultMessage =
    item.id === "chopsticks"
      ? "割り箸を獲得！"
      : `${item.name}を獲得！`;
  status.textContent = resultSaved
    ? [
        resultMessage,
        ...newlyUnlocked.map(
          (achievement) => `実績解除！ ${achievement.name}`
        )
      ].join(" ")
    : `${resultMessage} 実績・景品を保存できませんでした。`;

  if (!resultSaved) {
    saveData.gachaItems = previousItems;
    saveData.unlockedAchievements = previousAchievements;
  }

  setDrawingState(false);
  refresh(resultSaved ? [item.id] : []);
}

drawOnceButton.addEventListener("click", draw);

refresh();
