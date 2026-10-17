
import { target, DEBUG_MODE } from "./config.js";
import { rareStrings } from "./rareStrings.js";
import { startSecret, resetSecret } from "./secrets.js";

// ========================================
// デバッグ機能
// ========================================

export function setupDebug({
  state,
  render,
  winGame,
  startSecretPause,
  updateButtons,
  statusEl,
  sparkleEl,
  confettiEl,
  countEl
}) {
  // ----------------------------------------
  // デバッグ：通常クリア
  // ----------------------------------------

  function debugClear() {
    if (!DEBUG_MODE) return;
    if (state.cleared || state.animationLock) return;

    state.count++;
    countEl.textContent = state.count;

    resetSecret(state.secretState);

    state.chanceMode = false;
    state.chanceStep = 0;
    state.chanceLetters = [];

    state.letters = target.split("");

    winGame(true);
  }

  // ----------------------------------------
  // デバッグ：シークレット開始
  // ----------------------------------------

  function startDebugRareString(rareString) {
    if (!DEBUG_MODE) return;
    if (state.cleared || state.animationLock) return;

    startSecret(state.secretState, rareString, true);

    state.chanceMode = false;
    state.chanceStep = 0;
    state.chanceLetters = [];

    state.letters = [rareString.text[0]];
    state.cleared = false;

    render();
    startSecretPause();

    statusEl.textContent =
      `デバッグ：${rareString.display} シークレット`;

    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    updateButtons();
  }

  // ----------------------------------------
  // デバッグ：ええ手シークレット
  // ----------------------------------------

  function debugEete() {
    startDebugRareString(rareStrings[8]);
  }

  // ----------------------------------------
  // デバッグ：たんごむシークレット
  // ----------------------------------------

  function debugTangomu() {
    startDebugRareString(rareStrings[9]);
  }

  return {
    debugClear,
    debugEete,
    debugTangomu
  };
}

