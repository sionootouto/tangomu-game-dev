
let achievementDefinitions = [];
let getSaveData = () => ({
  unlockedAchievements: []
});

let onDeleteSave = () => {};

let toastTimer = null;

// ========================================
// HTML要素
// ========================================

const modal = document.getElementById("achievementModal");
const openButton = document.getElementById("openAchievements");
const closeButton = document.getElementById("closeAchievements");

const achievementList = document.getElementById("achievementList");
const achievementCount = document.getElementById("achievementCount");
const achievementProgress = document.getElementById("achievementProgress");
const achievementProgressBar = document.getElementById("achievementProgressBar");

const achievementToast = document.getElementById("achievementToast");
const saveDeleteButton = document.getElementById("saveDeleteButton");

// ========================================
// 実績一覧を表示
// ========================================

export function refreshAchievementList() {
  if (!achievementList) return;

  const saveData = getSaveData();
  const unlockedIds = Array.isArray(saveData.unlockedAchievements)
    ? saveData.unlockedAchievements
    : [];

  const total = achievementDefinitions.length;

  const unlockedCount = achievementDefinitions.filter(
    (achievement) => unlockedIds.includes(achievement.id)
  ).length;

  const percentage =
    total === 0 ? 0 : Math.round((unlockedCount / total) * 100);

  achievementCount.textContent = `${unlockedCount} / ${total}`;

  achievementProgress.setAttribute("aria-valuenow", String(percentage));
  achievementProgress.setAttribute(
    "aria-valuetext",
    `${percentage}%解除済み`
  );

  achievementProgressBar.style.width = `${percentage}%`;

  achievementList.replaceChildren();

  if (total === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "achievement-description";
    emptyMessage.textContent = "実績はまだ登録されていません。";
    achievementList.appendChild(emptyMessage);
    return;
  }

  for (const achievement of achievementDefinitions) {
    const unlocked = unlockedIds.includes(achievement.id);

    const card = document.createElement("article");
    card.className = unlocked
      ? "achievement-card unlocked"
      : "achievement-card locked";

    const icon = document.createElement("div");
    icon.className = "achievement-icon";
    icon.textContent = unlocked ? "🏆" : "🔒";
    icon.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "achievement-info";

    const name = document.createElement("h3");
    name.className = "achievement-name";
    name.textContent = unlocked
      ? achievement.name
      : "？？？？？";

    const description = document.createElement("p");
    description.className = "achievement-description";
    description.textContent = unlocked
      ? achievement.description
      : "条件を満たすと解除されます。";

    const status = document.createElement("span");
    status.className = "achievement-status";
    status.textContent = unlocked ? "✓ 解除済み" : "未解除";

    info.append(name, description, status);
    card.append(icon, info);
    achievementList.appendChild(card);
  }
}

// ========================================
// 実績一覧を開閉
// ========================================

function openAchievementModal() {
  refreshAchievementList();

  modal.hidden = false;
  document.body.classList.add("modal-open");

  closeButton.focus();
}

function closeAchievementModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");

  openButton.focus();
}

// ========================================
// 実績解除通知
// ========================================

export function showAchievementToast(newlyUnlocked) {
  if (!achievementToast || newlyUnlocked.length === 0) {
    return;
  }

  achievementToast.textContent =
    "🏆 実績解除！\n" +
    newlyUnlocked
      .map((achievement) => achievement.name)
      .join("\n");

  achievementToast.classList.remove("show");

  // 表示アニメーションを再スタートさせる
  void achievementToast.offsetWidth;

  achievementToast.classList.add("show");

  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    achievementToast.classList.remove("show");
    toastTimer = null;
  }, 2500);
}

// ========================================
// セーブデータ削除
// ========================================

function setupSaveDeleteButton() {
  saveDeleteButton.addEventListener("click", () => {
    const confirmed = confirm(
      "本当にセーブデータを削除しますか？\n" +
      "シャッフル回数・クリア回数・発見したシークレット・実績がリセットされます。"
    );

    if (!confirmed) return;

    onDeleteSave();
  });
}

// ========================================
// 初期化
// ========================================

export function setupAchievementUI({
  achievements,
  getSaveData: getSaveDataCallback,
  onDeleteSave: onDeleteSaveCallback
}) {
  achievementDefinitions = achievements;
  getSaveData = getSaveDataCallback;
  onDeleteSave = onDeleteSaveCallback;

  openButton.addEventListener("click", openAchievementModal);
  closeButton.addEventListener("click", closeAchievementModal);

  // 背景部分を押したときも閉じる
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeAchievementModal();
    }
  });

  // Escapeキーで閉じる
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeAchievementModal();
    }
  });

  setupSaveDeleteButton();
  refreshAchievementList();
}

