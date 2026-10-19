import { GACHA_ITEMS, SUCCESS_GACHA_ITEMS } from "./gachaItems.js";
import { loadSave, saveGame } from "./save.js";

const DRAW_COST = 10;
const MULTI_DRAW_COUNT = 10;
const REVEAL_DELAY = 1250;

const saveData = loadSave();
const coins = document.getElementById("gachaCoins");
const machine = document.querySelector(".gacha-machine");
const stage = document.getElementById("gachaStage");
const stageText = document.getElementById("gachaStageText");
const drawOnceButton = document.getElementById("drawGachaOnce");
const drawTenButton = document.getElementById("drawGachaTen");
const inventory = document.getElementById("gachaInventory");
const resultsSection = document.getElementById("gachaResultsSection");
const results = document.getElementById("gachaResults");
const resultSummary = document.getElementById("gachaResultSummary");
const status = document.getElementById("gachaStatus");

function refresh() {
  coins.textContent = String(saveData.coins);
  drawOnceButton.disabled = saveData.coins < DRAW_COST;
  drawTenButton.disabled = saveData.coins < DRAW_COST * MULTI_DRAW_COUNT;
  renderInventory();
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

    const label = document.createElement("span");
    label.className = "gacha-item-label";
    label.textContent = `${item.icon} ${item.name}`;

    const count = document.createElement("strong");
    count.className = "gacha-item-count";
    count.textContent = `${itemCounts[item.id] ?? 0} 個`;

    card.append(label, count);
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

function setDrawingState(isDrawing) {
  drawOnceButton.disabled = isDrawing || saveData.coins < DRAW_COST;
  drawTenButton.disabled =
    isDrawing || saveData.coins < DRAW_COST * MULTI_DRAW_COUNT;
}

async function draw(drawCount) {
  const cost = DRAW_COST * drawCount;
  if (saveData.coins < cost) {
    status.textContent = "Coinsが足りません。ゲームに戻ってCoinsを集めよう。";
    return;
  }

  const previousCoins = saveData.coins;
  const previousItems = saveData.gachaItems;
  const drawResults = Array.from({ length: drawCount }, rollItem);
  const nextItems = { ...saveData.gachaItems };
  drawResults.forEach((item) => {
    nextItems[item.id] = (nextItems[item.id] ?? 0) + 1;
  });

  saveData.coins -= cost;
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
  stageText.textContent = "割り箸をセット…";
  status.textContent = `${drawCount}回分の抽選を始めます！`;
  results.replaceChildren();
  resultsSection.hidden = false;
  resultSummary.textContent = `0 / ${drawCount}`;
  refresh();

  const highlightedItems = new Set();
  for (let index = 0; index < drawResults.length; index++) {
    const item = drawResults[index];
    machine.classList.add("breaking");
    stage.classList.remove("breaking");
    void stage.offsetWidth;
    stage.classList.add("breaking");
    stageText.textContent = "うまく割れるか...？";
    await delay(REVEAL_DELAY);

    const card = createResultCard(item, index + 1);
    results.appendChild(card);
    void card.offsetWidth;
    card.classList.add("revealed");
    highlightedItems.add(item.id);
    renderInventory([...highlightedItems]);

    const revealed = index + 1;
    resultSummary.textContent = `${revealed} / ${drawCount}`;
    machine.classList.remove("breaking");
    stage.classList.remove("breaking");
    stageText.textContent =
      item.id === "chopsticks" ? "今回はハズレ。" : "大当たり！";
    status.textContent =
      item.id === "chopsticks"
        ? `${revealed}回目：割り箸を獲得！`
        : `${revealed}回目：${item.name}を獲得！`;

    if (revealed < drawResults.length) {
      await delay(170);
    }
  }

  stageText.textContent = "また挑戦してね";
  machine.classList.remove("breaking");
  status.textContent = `${drawCount}回分の結果が出ました！ アイテムはコレクションに追加されています。`;
  setDrawingState(false);
  refresh();
}

function createResultCard(item, drawNumber) {
  const card = document.createElement("li");
  card.className = "gacha-result-card";
  if (item.id !== "chopsticks") {
    card.classList.add("success");
  }

  const icon = document.createElement("span");
  icon.className = "gacha-result-icon";
  icon.textContent = item.icon;

  const name = document.createElement("span");
  name.className = "gacha-result-name";
  name.textContent = item.name;

  const label = document.createElement("small");
  label.className = "gacha-result-label";
  label.textContent = `${drawNumber}回目・${
    item.id === "chopsticks" ? "ハズレ" : "成功！"
  }`;
  name.appendChild(label);
  card.append(icon, name);
  return card;
}

drawOnceButton.addEventListener("click", () => draw(1));
drawTenButton.addEventListener("click", () => draw(MULTI_DRAW_COUNT));

refresh();
