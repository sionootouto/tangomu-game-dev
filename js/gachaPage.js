import { GACHA_ITEMS, SUCCESS_GACHA_ITEMS } from "./gachaItems.js";
import { loadSave, saveGame } from "./save.js";

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

    card.append(image, name, count);
    inventory.appendChild(card);
  });
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
  const item = rollItem();
  const nextItems = { ...saveData.gachaItems };
  nextItems[item.id] = (nextItems[item.id] ?? 0) + 1;

  saveData.coins -= DRAW_COST;
  saveData.gachaItems = nextItems;

  if (!saveGame(saveData)) {
    saveData.coins = previousCoins;
    saveData.gachaItems = previousItems;
    status.textContent = "保存できなかったため、ガチャを中止しました。";
    refresh();
    return;
  }

  setDrawingState(true);
  stage.classList.remove("breaking");
  stageText.textContent = "うまく割れるか...？";
  status.textContent = "抽選中です…";
  refresh();

  machine.classList.add("breaking");
  stage.classList.remove("breaking");
  void stage.offsetWidth;
  stage.classList.add("breaking");
  await delay(REVEAL_DELAY);

  machine.classList.remove("breaking");
  stage.classList.remove("breaking");
  stageText.textContent = MESSAGES[item.id] ?? MESSAGES.default;
  status.textContent =
    item.id === "chopsticks"
      ? "割り箸を獲得！"
      : `${item.name}を獲得！`;

  setDrawingState(false);
  refresh([item.id]);
}

drawOnceButton.addEventListener("click", draw);

refresh();
