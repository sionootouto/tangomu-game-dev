
let chanceTimer = null;
let lastChanceTouchEnd = 0;

// ========================================
// チャンス演出中のタップ制御
// ========================================

export function setupChanceTouchControl() {
  document.addEventListener("touchend", (event) => {
    if (!document.body.classList.contains("chance-animation")) {
      lastChanceTouchEnd = 0;
      return;
    }

    const now = Date.now();

    if (now - lastChanceTouchEnd < 700) {
      event.preventDefault();
    }

    lastChanceTouchEnd = now;
  }, { passive: false });
}

// ========================================
// チャンス演出の表示
// ========================================

export function showChanceAnnouncement({
  chanceOverlay,
  gameButtons,
  setAnimationLock,
  updateButtons
}) {
  setAnimationLock(true);
  updateButtons();

  document.body.classList.add("chance-animation");

  gameButtons.forEach((button) => {
    button.classList.add("chance-disabled-look");
  });

  chanceOverlay.classList.remove("show");
  void chanceOverlay.offsetWidth;

  chanceOverlay.setAttribute("aria-hidden", "false");
  chanceOverlay.classList.add("show");

  if (chanceTimer !== null) {
    clearTimeout(chanceTimer);
  }

  chanceTimer = setTimeout(() => {
    hideChanceAnnouncement({
      chanceOverlay,
      gameButtons,
      setAnimationLock,
      updateButtons
    });
  }, 500);
}

// ========================================
// チャンス演出の非表示
// ========================================

export function hideChanceAnnouncement({
  chanceOverlay,
  gameButtons,
  setAnimationLock,
  updateButtons
}) {
  if (chanceTimer !== null) {
    clearTimeout(chanceTimer);
    chanceTimer = null;
  }

  chanceOverlay.classList.remove("show");
  chanceOverlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("chance-animation");

  gameButtons.forEach((button) => {
    button.classList.remove("chance-disabled-look");
  });

  setAnimationLock(false);
  lastChanceTouchEnd = 0;

  updateButtons();
}

