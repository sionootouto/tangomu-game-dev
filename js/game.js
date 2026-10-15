
import { reactionLines } from "./lines.js";
import { launchConfetti } from "./effects.js";
import { target, DEBUG_MODE, CHANCE } from "./config.js";
import { shuffledCopy, createChanceLetters } from "./shuffle.js";
import { rareStrings, drawRareString } from "./rareStrings.js";
import { loadSave, saveGame, deleteSave } from "./save.js";
import { achievements, checkAchievements } from "./achievements.js";
import {
  setupAchievementUI,
  showAchievementToast,
  refreshAchievementList
} from "./achievementUI.js";
import { playSE } from "./sounds.js";

import {
  isDopaChanceActive,
  showDopaEntrance,
  startDopaChance
} from "./dopaChance.js";

import {
  setupChanceTouchControl,
  showChanceAnnouncement as showChanceAnnouncementModule,
  hideChanceAnnouncement as hideChanceAnnouncementModule
} from "./chanceAnnouncement.js";

import {
  createSecretState,
  startSecret,
  advanceSecret,
  getSecretColorClass,
  getSecretCompletionText,
  recordSecretDiscovery,
  resetSecret
} from "./secrets.js";

let letters = [];
let chanceLetters = [];
let count = 0;

let saveData = loadSave();

// セーブ・実績
function persistSave() {
  const success = saveGame(saveData);

  if (!success) {
    console.error("セーブに失敗しました。保存データを確認してください。");
  }
}

function updateAchievements() {
  const newlyUnlocked = checkAchievements(saveData);

  if (newlyUnlocked.length > 0) {
    persistSave();
    showAchievementToast(newlyUnlocked);
  }

  refreshAchievementList();
}

function recordShuffle() {
  saveData.totalShuffles++;
  persistSave();
  updateAchievements();
}

function recordClear() {
  saveData.totalClears++;
  persistSave();
  updateAchievements();
}

// シークレット
const secretState = createSecretState();

let cleared = false;
let chanceMode = false;
let chanceStep = 0;
let animationLock = false;
let secretTimer = null;
let animationLockTimer = null;

const DOPA_CHANCE_RATE = 1 / 500;
const DOPA_CHANCE_MULTIPLIER = 2;
const DOPA_TANGOMU_RATE = 1 / 3;

// HTML要素
const lettersEl = document.getElementById("letters");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const sparkleEl = document.getElementById("sparkle");
const shuffleButton = document.getElementById("shuffle");
const resetButton = document.getElementById("reset");
const resetCountButton = document.getElementById("resetCount");
const debugButton = document.getElementById("debug");
const debugEeteButton = document.getElementById("debugEete");
const debugTangomuButton = document.getElementById("debugTangomu");
const confettiEl = document.getElementById("confetti");
const chanceOverlay = document.getElementById("chanceOverlay");
const gameButtons = document.querySelectorAll(".buttons button");

// デバッグボタンの表示設定
debugButton.hidden = !DEBUG_MODE;
debugEeteButton.hidden = !DEBUG_MODE;
debugTangomuButton.hidden = !DEBUG_MODE;

// ボタン状態の更新
function updateButtons() {
  shuffleButton.disabled = animationLock;
  resetButton.disabled = false;
  debugButton.disabled = animationLock;
  debugEeteButton.disabled = animationLock;
  debugTangomuButton.disabled = animationLock;
}

// ========================================
// チャンス演出モジュール
// ========================================

setupChanceTouchControl();

function showChanceAnnouncement() {
  showChanceAnnouncementModule({
    chanceOverlay,
    gameButtons,
    setAnimationLock: (value) => {
      animationLock = value;
    },
    updateButtons
  });
}

function hideChanceAnnouncement() {
  hideChanceAnnouncementModule({
    chanceOverlay,
    gameButtons,
    setAnimationLock: (value) => {
      animationLock = value;
    },
    updateButtons
  });
}

// ========================================
// 画面表示
// ========================================

function render() {
  lettersEl.replaceChildren();

  const secretColorClass = getSecretColorClass(secretState);

  letters.forEach((letter) => {
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
// ゲームクリア処理
// ========================================

function winGame(isDebug = false) {
  const current = letters.join("");
  const isBigWin = current === target;

  if (isBigWin) {
    playSE("clear");
  } else if (chanceMode) {
    playSE("chanceMiss");
  }

  if (isBigWin) {
    if (!isDebug) {
      recordClear();
    }

    cleared = true;
    chanceMode = false;
    chanceStep = 0;

    render();

    statusEl.textContent =
      reactionLines[current] || "クリア！\n君が真のたんごむだ！";

    statusEl.classList.add("win");
    sparkleEl.classList.add("show");

    launchConfetti(confettiEl);
  } else {
    cleared = false;
    chanceMode = false;
    chanceStep = 0;

    render();

    statusEl.textContent = reactionLines[current] || "...";

    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();
  }

  updateButtons();
}

// ========================================
// シャッフル処理
// ========================================

function shuffle() {
  if (animationLock) return;

  if (cleared) {
    reset();
    return;
  }

  count++;
  countEl.textContent = count;

  recordShuffle();

  // ----------------------------------------
  // シークレット進行中
  // ----------------------------------------

  if (secretState.active) {
    const result = advanceSecret(secretState);

    letters.push(result.letter);

    render();

    if (result.completed) {
      playSE("secret");

      if (!result.isDebug) {
        recordSecretDiscovery(
          result.secret.text,
          {
            saveData,
            persistSave,
            updateAchievements
          }
        );
      }

      statusEl.textContent =
        getSecretCompletionText(result.secret);

      resetSecret(secretState);

      startSecretPause();

      return;
    }

    startSecretPause();

    return;
  }

  // ----------------------------------------
  // チャンスモード
  // ----------------------------------------

  if (chanceMode) {
    if (chanceStep >= 4) {
      chanceMode = false;
      chanceStep = 0;

      letters = shuffledCopy();

      cleared = letters.join("") === target;

      render();

      if (cleared) {
        winGame();
      } else {
        statusEl.textContent =
          "まだまだ！ もう一回シャッフル！";

        updateButtons();
      }

      return;
    }

    letters.push(chanceLetters[chanceStep]);
    chanceStep++;

    if (letters.length === 7) {
      const isBigWin = letters.join("") === target;

      if (animationLockTimer !== null) {
        clearTimeout(animationLockTimer);
        animationLockTimer = null;
      }

      animationLock = true;
      updateButtons();

      animationLockTimer = setTimeout(() => {
        animationLock = false;
        animationLockTimer = null;
        updateButtons();
      }, isBigWin ? 1000 : 500);

      winGame();

      return;
    }

    render();

    const current = letters.join("");

    if (
      current === "tang" ||
      current === "tango" ||
      current === "tangom"
    ) {
      statusEl.textContent =
        "チャンス継続中！ 次の文字を出そう！";
    } else {
      statusEl.textContent = "...";
    }

    return;
  }

  // ----------------------------------------
  // DOPA CHANCEの突入抽選
  // ----------------------------------------

  if (
    !isDopaChanceActive() &&
    Math.random() < DOPA_CHANCE_RATE
  ) {
    showDopaEntrance({
      statusEl,
      setAnimationLock: (value) => {
        animationLock = value;
      },
      updateButtons,
      startDopaChance: () => startDopaChance(statusEl)
    });

    return;
  }

  // ----------------------------------------
  // シークレット抽選
  // ----------------------------------------

  const rareString = drawRareString(isDopaChanceActive());

  if (rareString !== null) {
    startSecret(secretState, rareString, false);

    letters = [rareString.text[0]];

    render();

    startSecretPause();

    statusEl.textContent = "おっと...？";
    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    return;
  }

  // ----------------------------------------
  // たんごむチャンス抽選
  // ----------------------------------------

  const dopaActive = isDopaChanceActive();

  const chanceProbability = dopaActive
    ? Math.min(CHANCE * DOPA_CHANCE_MULTIPLIER, 1)
    : CHANCE;

  if (Math.random() < chanceProbability) {
    playSE("chance");

    chanceMode = true;
    chanceStep = 0;

    chanceLetters = createChanceLetters(
      dopaActive,
      DOPA_TANGOMU_RATE
    );

    letters = ["t", "a", "n"];

    render();

    statusEl.textContent = "たんごむチャンス！";

    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    showChanceAnnouncement();

    return;
  }

  // ----------------------------------------
  // 通常シャッフル
  // ----------------------------------------

  letters = shuffledCopy();

  cleared = letters.join("") === target;

  render();

  if (cleared) {
    winGame();
  } else {
    statusEl.textContent =
      "まだまだ！ もう一回シャッフル！";

    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    updateButtons();
  }
}

// ========================================
// デバッグ：通常クリア
// ========================================

function debugClear() {
  if (cleared || animationLock) return;

  count++;
  countEl.textContent = count;

  resetSecret(secretState);

  chanceMode = false;
  chanceStep = 0;

  letters = target.split("");

  winGame(true);
}

// ========================================
// デバッグ：シークレット開始
// ========================================

function startDebugRareString(rareString) {
  if (cleared || animationLock) return;

  startSecret(secretState, rareString, true);

  chanceMode = false;
  chanceStep = 0;

  letters = [rareString.text[0]];

  cleared = false;

  render();

  startSecretPause();

  statusEl.textContent =
    `デバッグ：${rareString.display} シークレット`;

  statusEl.classList.remove("win");
  sparkleEl.classList.remove("show");

  confettiEl.replaceChildren();

  updateButtons();
}

function debugEete() {
  startDebugRareString(rareStrings[8]);
}

function debugTangomu() {
  startDebugRareString(rareStrings[9]);
}

// ========================================
// シークレットの一時停止
// ========================================

function startSecretPause() {
  if (secretTimer !== null) {
    clearTimeout(secretTimer);
  }

  animationLock = true;
  updateButtons();

  secretTimer = setTimeout(() => {
    secretTimer = null;
    animationLock = false;
    updateButtons();
  }, 1000);
}

// ========================================
// リセット
// ========================================

function reset() {
  hideChanceAnnouncement();

  if (secretTimer !== null) {
    clearTimeout(secretTimer);
    secretTimer = null;
  }

  if (animationLockTimer !== null) {
    clearTimeout(animationLockTimer);
    animationLockTimer = null;
  }

  resetSecret(secretState);

  animationLock = false;
  cleared = false;

  chanceMode = false;
  chanceStep = 0;
  chanceLetters = [];

  letters = shuffledCopy();

  if (letters.join("") === target) {
    letters = shuffledCopy();
  }

  render();

  statusEl.textContent =
    "「シャッフル！」を押して挑戦しよう。";

  statusEl.classList.remove("win");
  sparkleEl.classList.remove("show");

  confettiEl.replaceChildren();

  updateButtons();
}

// ========================================
// シャッフル回数リセット
// ========================================

function resetShuffleCount() {
  count = 0;
  countEl.textContent = "0";

  statusEl.textContent =
    "シャッフル回数をリセットしたよ！";

  playSE("button");
}

// ========================================
// ボタンの操作制御・効果音
// ========================================

document.addEventListener("click", (event) => {
  const button = event.target.closest?.("button");

  if (button) {
    if (animationLock || button.disabled) {
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

shuffleButton.addEventListener("click", shuffle);
resetButton.addEventListener("click", reset);
resetCountButton.addEventListener("click", resetShuffleCount);

debugButton.addEventListener("click", debugClear);
debugEeteButton.addEventListener("click", debugEete);
debugTangomuButton.addEventListener("click", debugTangomu);

// ========================================
// 実績UI初期化
// ========================================

setupAchievementUI({
  achievements,
  getSaveData: () => saveData,
  onDeleteSave: () => {
    deleteSave();
    location.reload();
  }
});

// ========================================
// 初期化
// ========================================

reset();
updateAchievements();
