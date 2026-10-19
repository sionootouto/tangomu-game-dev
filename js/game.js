
import {
  target,
  DEBUG_MODE,
  CHANCE_UPGRADE_RATES,
  CHANCE_UPGRADE_COSTS,
  CHANCE_TYPE_UPGRADE_COSTS,
  DOPA_SKILL_UNLOCK_COST,
  DOPA_SKILL_COOLDOWNS,
  DOPA_SKILL_UPGRADE_COSTS
} from "./config.js";
import { shuffledCopy } from "./shuffle.js";
import {
  loadSave,
  saveGame,
  deleteSave,
  SECRET_HISTORY_ID_OFFSET
} from "./save.js";
import { achievements, checkAchievements } from "./achievements.js";
import {
  setupAchievementUI,
  showAchievementToast,
  refreshAchievementList
} from "./achievementUI.js";
import { playSE } from "./sounds.js";
import {
  setupChanceTouchControl,
  showChanceAnnouncement as showChanceAnnouncementModule,
  hideChanceAnnouncement as hideChanceAnnouncementModule
} from "./chanceAnnouncement.js";
import {
  createSecretState,
  getSecretColorClass
} from "./secrets.js";
import { createShuffleManager } from "./shuffleManager.js";
import { setupDebug } from "./debug.js";
import { createGameActions } from "./gameActions.js";
import { createResetHandler } from "./reset.js";
import { setupCollectionUI } from "./collectionUI.js";
import {
  isDopaChanceActive,
  startDopaChance
} from "./dopaChance.js";

// ========================================
// ゲームの状態
// ========================================

const state = {
  letters: [],
  chanceLetters: [],
  count: 0,
  saveData: loadSave(),
  secretState: createSecretState(),
  cleared: false,
  chanceMode: false,
  chanceStep: 0,
  animationLock: false,
  secretTimer: null,
  animationLockTimer: null
};

// ========================================
// HTML要素
// ========================================

const lettersEl = document.getElementById("letters");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const coinsEl = document.getElementById("coins");
const sparkleEl = document.getElementById("sparkle");
const shuffleButton = document.getElementById("shuffle");
const gameButtonContainer = shuffleButton.parentElement;
const resetButton = document.getElementById("reset");
const resetCountButton = document.getElementById("resetCount");
const debugButton = document.getElementById("debug");
const debugEeteButton = document.getElementById("debugEete");
const debugTangomuButton = document.getElementById("debugTangomu");
const confettiEl = document.getElementById("confetti");
const chanceOverlay = document.getElementById("chanceOverlay");
const gameButtons = document.querySelectorAll(".buttons button");

// ========================================
// デバッグボタンの表示設定
// ========================================

debugButton.hidden = !DEBUG_MODE;
debugEeteButton.hidden = !DEBUG_MODE;
debugTangomuButton.hidden = !DEBUG_MODE;

// ========================================
// セーブ・実績
// ========================================

function persistSave() {
  const success = saveGame(state.saveData);

  if (!success) {
    console.error(
      "セーブに失敗しました。保存データを確認してください。"
    );
  }

  return success;
}

function updateAchievements() {
  const newlyUnlocked = checkAchievements(state.saveData);

  if (newlyUnlocked.length > 0) {
    persistSave();
    showAchievementToast(newlyUnlocked);
  }

  refreshAchievementList();
}

function recordShuffle() {
  state.saveData.totalShuffles++;
  persistSave();
  updateAchievements();
}

function recordClear(clearType = "normal") {
  state.saveData.totalClears++;
  if (state.count <= 10) {
    state.saveData.clearedWithin10Shuffles = true;
  }
  if (state.count <= 50) {
    state.saveData.clearedWithin50Shuffles = true;
  }
  if (state.count <= 100) {
    state.saveData.clearedWithin100Shuffles = true;
  }
  if (clearType === "chance") {
    state.saveData.chanceClears++;
  } else {
    state.saveData.normalShuffleClears++;
  }
  state.saveData.coins++;
  coinsEl.textContent = String(state.saveData.coins);
  persistSave();
  updateAchievements();
}

function rewardSecretCoins(secret, isFirstDiscovery) {
  const baseReward = {
    normal: 1,
    purple: 2,
    gold: 3
  }[secret.color];

  const reward = baseReward * (isFirstDiscovery ? 3 : 1);
  state.saveData.coins += reward;
  coinsEl.textContent = String(state.saveData.coins);
}

function recordReaction(reactionId) {
  recordReactionHistoryEntry({ reactionId });
  const counts = { ...(state.saveData.reactionCounts ?? {}) };

  counts[reactionId] = (counts[reactionId] ?? 0) + 1;
  state.saveData.reactionCounts = counts;
  persistSave();
  updateAchievements();
}

function recordSecretHistory(secret) {
  recordReactionHistoryEntry({ secretNumber: secret.number });
}

function recordReactionHistoryEntry(entry) {
  const sequence = (state.saveData.reactionHistorySequence ?? 0) + 1;
  const history = state.saveData.reactionHistory ?? [];
  const numericId =
    entry.reactionId ?? SECRET_HISTORY_ID_OFFSET + entry.secretNumber;

  state.saveData.reactionHistory = [
    ...history,
    { sequence, ...entry }
  ].slice(-10);
  state.saveData.reactionAndSecretHistory = [
    ...(state.saveData.reactionAndSecretHistory ?? []),
    numericId
  ].slice(-10);
  state.saveData.reactionHistorySequence = sequence;
}

// ========================================
// ボタンの状態更新
// ========================================

function updateButtons() {
  shuffleButton.disabled = state.animationLock;
  resetButton.disabled = false;
  debugButton.disabled = state.animationLock;
  debugEeteButton.disabled = state.animationLock;
  debugTangomuButton.disabled = state.animationLock;

  // クリア画面のときにリセット可能
  const canResetCount = state.cleared;

  resetCountButton.disabled = false;
  resetCountButton.classList.toggle(
    "is-locked",
    !canResetCount
  );

  resetCountButton.setAttribute(
    "aria-disabled",
    String(!canResetCount)
  );
}

// ========================================
// チャンス演出
// ========================================

setupChanceTouchControl();

function showChanceAnnouncement() {
  showChanceAnnouncementModule({
    chanceOverlay,
    gameButtons,
    setAnimationLock: (value) => {
      state.animationLock = value;
    },
    updateButtons
  });
}

function hideChanceAnnouncement() {
  hideChanceAnnouncementModule({
    chanceOverlay,
    gameButtons,
    setAnimationLock: (value) => {
      state.animationLock = value;
    },
    updateButtons
  });
}

// ========================================
// 画面表示
// ========================================

function render() {
  lettersEl.replaceChildren();

  const secretColorClass = getSecretColorClass(state.secretState);

  state.letters.forEach((letter) => {
    const span = document.createElement("span");

    span.className = "letter";
    span.textContent = letter;

    if (secretColorClass) {
      span.classList.add(secretColorClass);
    }

    lettersEl.appendChild(span);
  });
}

// ========================================
// リセット処理モジュールの作成
// ========================================

const { reset } = createResetHandler({
  state,
  render,
  updateButtons,
  hideChanceAnnouncement,
  statusEl,
  sparkleEl,
  confettiEl
});

// ========================================
// クリア処理モジュールの作成
// ========================================

const { winGame } = createGameActions({
  state,
  recordClear,
  recordReaction,
  render,
  updateButtons,
  statusEl,
  sparkleEl,
  confettiEl
});

// ========================================
// シークレットの一時停止
// ========================================

function startSecretPause() {
  if (state.secretTimer !== null) {
    clearTimeout(state.secretTimer);
  }

  state.animationLock = true;
  updateButtons();

  state.secretTimer = setTimeout(() => {
    state.secretTimer = null;
    state.animationLock = false;
    updateButtons();
  }, 1000);
}

// ========================================
// シャッフル管理モジュールの作成
// ========================================

const shuffleManager = createShuffleManager({
  state,
  render,
  updateButtons,
  updateAchievements,
  persistSave,
  recordShuffle,
  recordClear,
  rewardSecretCoins,
  recordSecretHistory,
  winGame,
  reset: () => reset(),
  startSecretPause,
  showChanceAnnouncement,
  statusEl,
  sparkleEl,
  confettiEl
});

// ========================================
// デバッグ管理モジュールの作成
// ========================================

const debug = setupDebug({
  state,
  render,
  winGame,
  startSecretPause,
  updateButtons,
  statusEl,
  sparkleEl,
  confettiEl,
  countEl
});

// ========================================
// シャッフル回数リセット
// ========================================

function resetShuffleCount() {
  if (!state.cleared) {
    alert("クリア画面のときだけ回数をリセットできます！");
    return;
  }

  state.count = 0;
  countEl.textContent = "0";

  statusEl.textContent =
    "シャッフル回数をリセットしたよ！";

  playSE("button");
  updateButtons();
}

// ========================================
// ボタンの操作制御・効果音
// ========================================

document.addEventListener("click", (event) => {
  const button = event.target.closest?.("button");

  if (button) {
    if (state.animationLock || button.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (button.id !== "resetCount") {
      playSE("button");
    }
  }
}, true);

// ========================================
// イベント登録
// ========================================

shuffleButton.addEventListener(
  "click",
  () => shuffleManager.shuffle()
);

resetButton.addEventListener("click", reset);

resetCountButton.addEventListener(
  "click",
  resetShuffleCount
);

debugButton.addEventListener("click", debug.debugClear);
debugEeteButton.addEventListener("click", debug.debugEete);
debugTangomuButton.addEventListener("click", debug.debugTangomu);

// ========================================
// 実績UI初期化
// ========================================

setupAchievementUI({
  achievements,
  getSaveData: () => state.saveData,
  onDeleteSave: () => {
    deleteSave();
    location.reload();
  }
});

// ========================================
// 図鑑・プレイ記録UI初期化
// ========================================

setupCollectionUI({
  getSaveData: () => state.saveData
});

// ========================================
// Upgrade画面
// ========================================

const upgradeModal = document.getElementById("upgradeModal");
const openUpgradeButton = document.getElementById("openUpgrade");
const closeUpgradeButton = document.getElementById("closeUpgrade");
const chanceUpgradeRate = document.getElementById("chanceUpgradeRate");
const chanceUpgradeDescription = document.getElementById(
  "chanceUpgradeDescription"
);
const chanceUpgradeStatus = document.getElementById("chanceUpgradeStatus");
const buyChanceUpgradeButton = document.getElementById("buyChanceUpgrade");
const chanceTypeUpgradeState = document.getElementById("chanceTypeUpgradeState");
const chanceTypeUpgradeDescription = document.getElementById(
  "chanceTypeUpgradeDescription"
);
const chanceTypeUpgradeButton = document.getElementById(
  "chanceTypeUpgradeButton"
);
const chanceTypeUpgradeStatus = document.getElementById(
  "chanceTypeUpgradeStatus"
);
const dopaSkillState = document.getElementById("dopaSkillState");
const dopaSkillDescription = document.getElementById("dopaSkillDescription");
const dopaSkillStatus = document.getElementById("dopaSkillStatus");
const dopaSkillAction = document.getElementById("dopaSkillAction");
const dopaSkillActivateButton = document.getElementById("dopaSkillActivate");
const dopaSkillCooldown = document.getElementById("dopaSkillCooldown");
const dopaSkillUpgradeDescription = document.getElementById(
  "dopaSkillUpgradeDescription"
);

function refreshUpgradeUI() {
  const level = state.saveData.chanceUpgradeLevel;
  const rate = CHANCE_UPGRADE_RATES[level];
  const nextCost = CHANCE_UPGRADE_COSTS[level];

  chanceUpgradeRate.textContent = `1/${Math.round(1 / rate)}`;

  if (nextCost === undefined) {
    chanceUpgradeDescription.textContent = "このアップグレードは最大レベルです。";
    buyChanceUpgradeButton.textContent = "最大レベル";
    buyChanceUpgradeButton.disabled = true;
  } else {
    chanceUpgradeDescription.textContent =
      `次の強化：1/${Math.round(1 / CHANCE_UPGRADE_RATES[level + 1])} ` +
      `（ドパコイン ${nextCost} 枚）`;
    buyChanceUpgradeButton.textContent = "強化する";
    buyChanceUpgradeButton.disabled = state.saveData.coins < nextCost;
  }

  refreshChanceTypeUpgradeUI();
  refreshDopaSkillUI();
}

function refreshChanceTypeUpgradeUI() {
  const level = state.saveData.chanceTypeUpgradeLevel;
  const cost = CHANCE_TYPE_UPGRADE_COSTS[level];

  chanceTypeUpgradeState.textContent = [
    "通常のみ",
    "スーパー解禁",
    "ハイパー解禁"
  ][level];

  if (level === 0) {
    chanceTypeUpgradeDescription.textContent =
      "スーパーは4文字目、ハイパーは5文字目まで確定。種類は通常チャンス発生時に抽選されます。";
  } else if (level === 1) {
    chanceTypeUpgradeDescription.textContent =
      "通常のほか、スーパー（通常の1/3の相対確率）が抽選されます。";
  } else {
    chanceTypeUpgradeDescription.textContent =
      "通常・スーパー（相対確率1/3）・ハイパー（相対確率1/7）が抽選されます。";
  }

  if (cost === undefined) {
    chanceTypeUpgradeButton.textContent = "最大レベル";
    chanceTypeUpgradeButton.disabled = true;
    return;
  }

  const nextType = level === 0 ? "スーパー" : "ハイパー";
  chanceTypeUpgradeButton.textContent =
    `${nextType}を解禁（${cost}コイン）`;
  chanceTypeUpgradeButton.disabled = state.saveData.coins < cost;
}

function formatCooldown(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.ceil((milliseconds % 60000) / 1000);
  return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分`;
}

function refreshDopaSkillUI() {
  const unlocked = state.saveData.dopaSkillUnlocked;
  const level = state.saveData.dopaSkillUpgradeLevel;
  const cooldown = DOPA_SKILL_COOLDOWNS[level];
  const nextCost = DOPA_SKILL_UPGRADE_COSTS[level];
  const remaining = Math.max(
    0,
    state.saveData.dopaSkillLastUsedAt + cooldown - Date.now()
  );
  const active = isDopaChanceActive();

  gameButtonContainer.classList.toggle("has-dopa-skill", unlocked);
  dopaSkillActivateButton.hidden = !unlocked;
  dopaSkillState.textContent = unlocked ? "解放済み" : "未解放";
  dopaSkillCooldown.textContent = formatCooldown(cooldown);

  if (!unlocked) {
    dopaSkillDescription.textContent =
      `ドパコイン${DOPA_SKILL_UNLOCK_COST}枚で解放すると、DOPA CHANCEを任意に発動できます。`;
    dopaSkillAction.textContent =
      `技を解放（${DOPA_SKILL_UNLOCK_COST}コイン）`;
    dopaSkillAction.disabled =
      state.saveData.coins < DOPA_SKILL_UNLOCK_COST;
    dopaSkillUpgradeDescription.textContent =
      "解放後、このボタンは再使用時間の短縮に切り替わります。";
    dopaSkillActivateButton.textContent = "技を解放すると使用できます";
    dopaSkillActivateButton.disabled = true;
    return;
  }

  dopaSkillDescription.textContent =
    "発動するとDOPA CHANCEが60秒間続きます。";
  dopaSkillActivateButton.textContent = active
    ? "DOPA CHANCE発動中"
    : remaining > 0
      ? `再使用まで ${formatCooldown(remaining)}`
      : "DOPA CHANCEを発動";
  dopaSkillActivateButton.disabled =
    active || state.animationLock || remaining > 0;

  if (nextCost === undefined) {
    dopaSkillUpgradeDescription.textContent =
      "再使用時間は最短の2分です。";
    dopaSkillAction.textContent = "再使用時間は最大強化済み";
    dopaSkillAction.disabled = true;
    return;
  }

  dopaSkillUpgradeDescription.textContent =
    `次の強化：${formatCooldown(DOPA_SKILL_COOLDOWNS[level + 1])} ` +
    `（ドパコイン ${nextCost} 枚）`;
  dopaSkillAction.textContent =
    `再使用時間を短縮（${nextCost}コイン）`;
  dopaSkillAction.disabled =
    state.saveData.coins < nextCost;
}

function closeUpgradeModal() {
  upgradeModal.hidden = true;
  openUpgradeButton.focus();
}

openUpgradeButton.addEventListener("click", () => {
  refreshUpgradeUI();
  chanceUpgradeStatus.textContent = "";
  chanceTypeUpgradeStatus.textContent = "";
  dopaSkillStatus.textContent = "";
  upgradeModal.hidden = false;
  closeUpgradeButton.focus();
});

function closeUpgradeModalAndStopRefresh() {
  closeUpgradeModal();
}

closeUpgradeButton.addEventListener(
  "click",
  closeUpgradeModalAndStopRefresh
);

buyChanceUpgradeButton.addEventListener("click", () => {
  const level = state.saveData.chanceUpgradeLevel;
  const cost = CHANCE_UPGRADE_COSTS[level];

  if (cost === undefined) {
    refreshUpgradeUI();
    return;
  }

  if (state.saveData.coins < cost) {
    chanceUpgradeStatus.textContent = "ドパコインが足りません。";
    refreshUpgradeUI();
    return;
  }

  state.saveData.coins -= cost;
  state.saveData.chanceUpgradeLevel++;

  if (!persistSave()) {
    state.saveData.coins += cost;
    state.saveData.chanceUpgradeLevel--;
    chanceUpgradeStatus.textContent =
      "保存できなかったため、強化を取り消しました。";
    refreshUpgradeUI();
    return;
  }

  coinsEl.textContent = String(state.saveData.coins);
  chanceUpgradeStatus.textContent = "強化しました！";
  refreshUpgradeUI();
});

chanceTypeUpgradeButton.addEventListener("click", () => {
  const level = state.saveData.chanceTypeUpgradeLevel;
  const cost = CHANCE_TYPE_UPGRADE_COSTS[level];

  if (cost === undefined || state.saveData.coins < cost) {
    if (cost !== undefined) {
      chanceTypeUpgradeStatus.textContent = "ドパコインが足りません。";
    }
    refreshChanceTypeUpgradeUI();
    return;
  }

  state.saveData.coins -= cost;
  state.saveData.chanceTypeUpgradeLevel++;

  if (!persistSave()) {
    state.saveData.coins += cost;
    state.saveData.chanceTypeUpgradeLevel--;
    chanceTypeUpgradeStatus.textContent =
      "保存できなかったため、解禁を取り消しました。";
    refreshChanceTypeUpgradeUI();
    return;
  }

  coinsEl.textContent = String(state.saveData.coins);
  chanceTypeUpgradeStatus.textContent =
    `${level === 0 ? "スーパー" : "ハイパー"}を解禁しました！`;
  refreshChanceTypeUpgradeUI();
});

dopaSkillAction.addEventListener("click", () => {
  if (!state.saveData.dopaSkillUnlocked) {
    if (state.saveData.coins < DOPA_SKILL_UNLOCK_COST) {
      dopaSkillStatus.textContent = "ドパコインが足りません。";
      return;
    }

    state.saveData.coins -= DOPA_SKILL_UNLOCK_COST;
    state.saveData.dopaSkillUnlocked = true;

    if (!persistSave()) {
      state.saveData.coins += DOPA_SKILL_UNLOCK_COST;
      state.saveData.dopaSkillUnlocked = false;
      dopaSkillStatus.textContent =
        "保存できなかったため、解放を取り消しました。";
      refreshUpgradeUI();
      return;
    }

    coinsEl.textContent = String(state.saveData.coins);
    dopaSkillStatus.textContent = "技を解放しました！";
    refreshUpgradeUI();
    return;
  }

  const level = state.saveData.dopaSkillUpgradeLevel;
  const cost = DOPA_SKILL_UPGRADE_COSTS[level];
  if (cost === undefined || state.saveData.coins < cost) {
    refreshUpgradeUI();
    return;
  }

  state.saveData.coins -= cost;
  state.saveData.dopaSkillUpgradeLevel++;

  if (!persistSave()) {
    state.saveData.coins += cost;
    state.saveData.dopaSkillUpgradeLevel--;
    dopaSkillStatus.textContent =
      "保存できなかったため、強化を取り消しました。";
    refreshUpgradeUI();
    return;
  }

  coinsEl.textContent = String(state.saveData.coins);
  dopaSkillStatus.textContent = "再使用時間を短縮しました！";
  refreshUpgradeUI();
});

dopaSkillActivateButton.addEventListener("click", () => {
  if (!state.saveData.dopaSkillUnlocked) {
    refreshDopaSkillUI();
    return;
  }

  const cooldown =
    DOPA_SKILL_COOLDOWNS[state.saveData.dopaSkillUpgradeLevel];
  if (
    isDopaChanceActive() ||
    Date.now() < state.saveData.dopaSkillLastUsedAt + cooldown
  ) {
    refreshDopaSkillUI();
    return;
  }

  const previousLastUsedAt = state.saveData.dopaSkillLastUsedAt;
  state.saveData.dopaSkillLastUsedAt = Date.now();
  state.saveData.totalDopaChances =
    (state.saveData.totalDopaChances ?? 0) + 1;

  if (!persistSave()) {
    state.saveData.dopaSkillLastUsedAt = previousLastUsedAt;
    state.saveData.totalDopaChances--;
    dopaSkillStatus.textContent =
      "保存できなかったため、技を発動できませんでした。";
    refreshUpgradeUI();
    return;
  }

  startDopaChance(statusEl);
  updateAchievements();
  dopaSkillStatus.textContent = "DOPA CHANCEを発動しました！";
  refreshUpgradeUI();
});

upgradeModal.addEventListener("click", (event) => {
  if (event.target === upgradeModal) {
    closeUpgradeModalAndStopRefresh();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !upgradeModal.hidden) {
    closeUpgradeModalAndStopRefresh();
  }
});

// ========================================
// 初期化
// ========================================

reset();
coinsEl.textContent = String(state.saveData.coins);
refreshUpgradeUI();
setInterval(refreshDopaSkillUI, 1000);
updateButtons();
updateAchievements();
