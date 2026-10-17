
import { target } from "./config.js";
import { shuffledCopy } from "./shuffle.js";
import { resetSecret } from "./secrets.js";

export function createResetHandler({
  state,
  render,
  updateButtons,
  hideChanceAnnouncement,
  statusEl,
  sparkleEl,
  confettiEl
}) {
  function reset() {
    hideChanceAnnouncement();

    if (state.secretTimer !== null) {
      clearTimeout(state.secretTimer);
      state.secretTimer = null;
    }

    if (state.animationLockTimer !== null) {
      clearTimeout(state.animationLockTimer);
      state.animationLockTimer = null;
    }

    resetSecret(state.secretState);

    state.animationLock = false;
    state.cleared = false;

    state.chanceMode = false;
    state.chanceStep = 0;
    state.chanceLetters = [];

    state.letters = shuffledCopy();

    if (state.letters.join("") === target) {
      state.letters = shuffledCopy();
    }

    render();

    statusEl.textContent =
      "「シャッフル！」を押して挑戦しよう。";

    statusEl.classList.remove("win");
    sparkleEl.classList.remove("show");

    confettiEl.replaceChildren();

    updateButtons();
  }

  return { reset };
}
