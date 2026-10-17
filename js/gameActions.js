
import { reactionLines } from "./lines.js";
import { launchConfetti } from "./effects.js";
import { target } from "./config.js";
import { playSE } from "./sounds.js";

export function createGameActions({
  state,
  recordClear,
  recordReaction,
  render,
  updateButtons,
  statusEl,
  sparkleEl,
  confettiEl
}) {
  function winGame(isDebug = false, isChanceClear = state.chanceMode) {
    const current = state.letters.join("");
    const isBigWin = current === target;
    const reaction = reactionLines[current];

    if (isBigWin) {
      playSE("clear");
    } else if (state.chanceMode) {
      playSE("chanceMiss");
    }

    if (isBigWin) {
      if (!isDebug) {
        recordClear(isChanceClear ? "chance" : "normal");
        recordReaction(reaction.id);
      }

      state.cleared = true;
      state.chanceMode = false;
      state.chanceStep = 0;

      render();

      statusEl.textContent =
        reaction?.text || "クリア！\n君が真のたんごむだ！";

      statusEl.classList.add("win");
      sparkleEl.classList.add("show");
      launchConfetti(confettiEl);
    } else {
      state.cleared = false;
      state.chanceMode = false;
      state.chanceStep = 0;

      render();

      statusEl.textContent = reaction?.text || "...";

      if (reaction) {
        recordReaction(reaction.id);
      }

      statusEl.classList.remove("win");
      sparkleEl.classList.remove("show");

      confettiEl.replaceChildren();
    }

    updateButtons();
  }

  return { winGame };
}
