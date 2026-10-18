
import {
  target,
  CHANCE,
  CHANCE_UPGRADE_RATES,
  CHANCE_TYPE_UPGRADE_WEIGHTS
} from "./config.js";
import { shuffledCopy, createChanceLetters } from "./shuffle.js";
import { drawRareString } from "./rareStrings.js";
import {
  isDopaChanceActive,
  showDopaEntrance,
  startDopaChance
} from "./dopaChance.js";
import {
  startSecret,
  advanceSecret,
  getSecretCompletionText,
  recordSecretDiscovery,
  resetSecret
} from "./secrets.js";
import { playSE } from "./sounds.js";

// ========================================
// シャッフル管理モジュール
// ========================================

const DOPA_CHANCE_RATE = 1 / 777;
const DOPA_CHANCE_MULTIPLIER = 2;
const DOPA_TANGOMU_RATE = 1 / 3;

/**
 * ゲームの状態と必要な処理を受け取り、
 * シャッフル進行を管理する。
 */
export function createShuffleManager({
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
  reset,
  startSecretPause,
  showChanceAnnouncement,
  statusEl,
  sparkleEl,
  confettiEl
}) {
  // ----------------------------------------
  // シークレット進行中のシャッフル
  // ----------------------------------------

  function handleSecretShuffle() {
    if (!state.secretState.active) {
      return false;
    }

    const result = advanceSecret(state.secretState);

    state.letters.push(result.letter);

    render();

    if (result.completed) {
      playSE("secret");

      if (!result.isDebug) {
        recordSecretHistory(result.secret);
        recordSecretDiscovery(result.secret, {
          saveData: state.saveData,
          persistSave,
          updateAchievements,
          rewardCoins: rewardSecretCoins
        });
      }

      statusEl.textContent =
        getSecretCompletionText(result.secret);

      resetSecret(state.secretState);

      startSecretPause();

      return true;
    }

    startSecretPause();

    return true;
  }

  // ----------------------------------------
  // チャンスモード進行
  // ----------------------------------------

  function handleChanceShuffle() {
    if (!state.chanceMode) {
      return false;
    }

    // 4文字を出し終わった後
    if (state.chanceStep >= 4) {
      state.chanceMode = false;
      state.chanceStep = 0;

      state.letters = shuffledCopy();
      state.cleared = state.letters.join("") === target;

      render();

      if (state.cleared) {
        winGame(false, true);
      } else {
        statusEl.textContent =
          "まだまだ！ もう一回シャッフル！";

        updateButtons();
      }

      return true;
    }

    // 次の文字を追加
    state.letters.push(
      state.chanceLetters[state.chanceStep]
    );

    state.chanceStep++;

    // 7文字そろった場合
    if (state.letters.length === 7) {
      const isBigWin =
        state.letters.join("") === target;

      if (state.animationLockTimer !== null) {
        clearTimeout(state.animationLockTimer);
        state.animationLockTimer = null;
      }

      state.animationLock = true;
      updateButtons();

      state.animationLockTimer = setTimeout(() => {
        state.animationLock = false;
        state.animationLockTimer = null;
        updateButtons();
      }, isBigWin ? 1000 : 500);

      winGame();

      return true;
    }

    render();

    const current = state.letters.join("");

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

    return true;
  }

  // ----------------------------------------
  // DOPA CHANCE突入抽選
  // ----------------------------------------

  function tryDopaChance() {
    if (
      isDopaChanceActive() ||
      Math.random() >= DOPA_CHANCE_RATE
    ) {
      return false;
    }

    state.saveData.totalDopaChances =
      (state.saveData.totalDopaChances ?? 0) + 1;

    persistSave();
    updateAchievements();

    showDopaEntrance({
      statusEl,
      setAnimationLock: (value) => {
        state.animationLock = value;
      },
      updateButtons,
      startDopaChance: () => startDopaChance(statusEl)
    });

    return true;
  }

  // ----------------------------------------
  // シークレット抽選
  // ----------------------------------------

  function tryRareString() {
    const rareString = drawRareString(
      isDopaChanceActive()
    );

    if (rareString === null) {
      return false;
    }

    startSecret(
      state.secretState,
      rareString,
      false
    );

    state.letters = [rareString.text[0]];

    render();

    startSecretPause();

    statusEl.textContent = "おっと...？";
    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    return true;
  }

  // ----------------------------------------
  // たんごむチャンス抽選
  // ----------------------------------------

  function tryChanceMode() {
    const dopaActive = isDopaChanceActive();
    const chanceRate =
      CHANCE_UPGRADE_RATES[state.saveData.chanceUpgradeLevel] ?? CHANCE;

    const chanceProbability = dopaActive
      ? Math.min(chanceRate * DOPA_CHANCE_MULTIPLIER, 1)
      : chanceRate;

    if (Math.random() >= chanceProbability) {
      return false;
    }

    const chanceType = chooseChanceType(
      state.saveData.chanceTypeUpgradeLevel ?? 0
    );
    playSE(chanceType.sound);

    state.chanceMode = true;
    state.chanceStep = 0;

    state.chanceLetters = createChanceLetters(
      dopaActive,
      DOPA_TANGOMU_RATE,
      chanceType.guaranteedLetters
    );

    state.letters = target
      .slice(0, chanceType.guaranteedLetters)
      .split("");

    render();

    statusEl.textContent = `${chanceType.label}！`;
    chanceOverlay.textContent = `${chanceType.label}！`;

    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    showChanceAnnouncement();

    return true;
  }

  function chooseChanceType(upgradeLevel) {
    const types = [
      {
        label: "たんごむチャンス",
        guaranteedLetters: 3,
        sound: "chance",
        weight: CHANCE_TYPE_UPGRADE_WEIGHTS.normal
      }
    ];

    if (upgradeLevel >= 1) {
      types.push({
        label: "スーパーたんごむチャンス",
        guaranteedLetters: 4,
        sound: "superChance",
        weight: CHANCE_TYPE_UPGRADE_WEIGHTS.super
      });
    }

    if (upgradeLevel >= 2) {
      types.push({
        label: "ハイパーたんごむチャンス",
        guaranteedLetters: 5,
        sound: "hyperChance",
        weight: CHANCE_TYPE_UPGRADE_WEIGHTS.hyper
      });
    }

    const totalWeight = types.reduce(
      (total, type) => total + type.weight,
      0
    );
    let roll = Math.random() * totalWeight;

    for (const type of types) {
      roll -= type.weight;
      if (roll < 0) {
        return type;
      }
    }

    return types[types.length - 1];
  }

  // ----------------------------------------
  // 通常シャッフル
  // ----------------------------------------

  function handleNormalShuffle() {
    state.letters = shuffledCopy();

    state.cleared =
      state.letters.join("") === target;

    render();

    if (state.cleared) {
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


  function shuffle() {
    if (state.animationLock) return;

    if (state.cleared) {
      reset();
      return;
    }

    // チャンス・シークレットの演出中は追加カウントしない
    const isSequenceStep =
      state.secretState.active || state.chanceMode;

    if (!isSequenceStep) {
      state.count++;

      document.getElementById("count").textContent =
        state.count;

      recordShuffle();
      updateButtons();
    }

    // 特殊モードを優先順に処理
    if (handleSecretShuffle()) return;
    if (handleChanceShuffle()) return;
    if (tryDopaChance()) return;
    if (tryRareString()) return;
    if (tryChanceMode()) return;

    handleNormalShuffle();
  }
    return {

    shuffle

  };

}
