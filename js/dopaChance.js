import {
  startDopaBGM,
  stopDopaBGM,
  playSE
} from "./sounds.js";

// ========================================
// DOPA CHANCEの設定
// ========================================

const DOPA_CHANCE_DURATION = 60 * 1000;

// ========================================
// DOPA CHANCEの管理
// ========================================

let dopaChanceActive = false;
let dopaChanceEndTime = 0;
let dopaChanceInterval = null;
let dopaBanner = null;
let dopaEntranceTimer = null;

// ========================================
// DOPA CHANCEの状態確認
// ========================================

export function isDopaChanceActive() {
  return dopaChanceActive;
}

// ========================================
// DOPA CHANCE突入演出
// ========================================

export function showDopaEntrance({
  statusEl,
  setAnimationLock,
  updateButtons,
  startDopaChance
}) {
  setAnimationLock(true);
  updateButtons();

  const overlay = document.createElement("div");
  overlay.className = "dopa-entrance";

  overlay.innerHTML = `
    <div class="dopa-flash"></div>
    <div class="dopa-lightning"></div>
    <div class="dopa-entrance-content">
      <div class="dopa-warning">SPECIAL EVENT</div>
      <div class="dopa-title">DOPA</div>
      <div class="dopa-subtitle">CHANCE!!</div>
      <div class="dopa-message">激アツ突入！！</div>
    </div>
  `;

  document.body.appendChild(overlay);
  playSE("dopaEnter");

  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  dopaEntranceTimer = setTimeout(() => {
    overlay.classList.add("dopa-exit");

    setTimeout(() => {
      overlay.remove();

      const infoOverlay = document.createElement("div");
      infoOverlay.className = "dopa-info";

      infoOverlay.innerHTML = `
        <div class="dopa-info-content">
          <div class="dopa-info-heading">
            🔥 DOPA CHANCE 突入中!! 🔥
          </div>

          <div class="dopa-info-subheading">
            60秒間のスペシャルチャンス！
          </div>

          <div class="dopa-info-item">
            <span>✨</span>
            <div>
              <strong>チャンス発生確率 2倍！</strong>
              <small>たんごむチャンスが出やすくなる！</small>
            </div>
          </div>

          <div class="dopa-info-item">
            <span>💎</span>
            <div>
              <strong>シークレット出現確率 10倍！</strong>
              <small>レアな文字列を狙え！</small>
            </div>
          </div>

          <div class="dopa-info-item">
            <span>🎯</span>
            <div>
              <strong>たんごむチャンス成功率 1/3！</strong>
              <small>チャンスをつかみ取れ！</small>
            </div>
          </div>

          <div class="dopa-info-footer">
            このチャンスを逃すな！！
          </div>
        </div>
      `;

      document.body.appendChild(infoOverlay);

      requestAnimationFrame(() => {
        infoOverlay.classList.add("active");
      });

      statusEl.textContent = "🔥 DOPA CHANCE突入！ 🔥";

      dopaEntranceTimer = setTimeout(() => {
        infoOverlay.classList.remove("active");

        setTimeout(() => {
          infoOverlay.remove();
          dopaEntranceTimer = null;

          setAnimationLock(false);
          updateButtons();

          startDopaChance();
        }, 300);

      }, 3000);

    }, 350);

  }, 2650);
}

// ========================================
// DOPA CHANCE開始
// ========================================

export function startDopaChance(statusEl) {
  dopaChanceActive = true;
  document.body.classList.add("dopa-rainbow");

  startDopaBGM();

  dopaChanceEndTime = Date.now() + DOPA_CHANCE_DURATION;

  if (dopaChanceInterval !== null) {
    clearInterval(dopaChanceInterval);
  }

  if (!dopaBanner) {
    dopaBanner = document.createElement("div");

    Object.assign(dopaBanner.style, {
      position: "fixed",
      top: "12px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "9999",
      padding: "12px 20px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #7c3aed, #db2777)",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "18px",
      textAlign: "center",
      boxShadow: "0 0 20px rgba(168, 85, 247, 0.8)",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    });

    document.body.appendChild(dopaBanner);
  }

  dopaBanner.hidden = false;

  function updateDopaTimer() {
    const remaining = Math.ceil(
      (dopaChanceEndTime - Date.now()) / 1000
    );

    if (remaining <= 0) {
      endDopaChance();
      return;
    }

    dopaBanner.textContent =
      `🔥 DOPA CHANCE!! 残り ${remaining} 秒 🔥`;
  }

  updateDopaTimer();
  dopaChanceInterval = setInterval(updateDopaTimer, 200);

  statusEl.textContent =
    "🔥 DOPA CHANCE突入！ チャンス到来！ 🔥";
}

// ========================================
// DOPA CHANCE終了
// ========================================

export function endDopaChance() {
  dopaChanceActive = false;

  document.body.classList.remove("dopa-rainbow");
  stopDopaBGM();

  if (dopaChanceInterval !== null) {
    clearInterval(dopaChanceInterval);
    dopaChanceInterval = null;
  }

  if (dopaBanner) {
    dopaBanner.hidden = true;
  }

  dopaChanceEndTime = 0;
}

// ========================================
// DOPA CHANCE関連のタイマーを解除
// ========================================

export function cancelDopaEntrance() {
  if (dopaEntranceTimer !== null) {
    clearTimeout(dopaEntranceTimer);
    dopaEntranceTimer = null;
  }
}
