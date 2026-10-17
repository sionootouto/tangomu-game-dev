
import { rareStrings } from "./rareStrings.js";

export function setupCollectionUI({ getSaveData }) {
  const modal = document.getElementById("collectionModal");
  const openButton = document.getElementById("openCollection");
  const closeButton = document.getElementById("closeCollection");
  const tabButtons = document.querySelectorAll("[data-collection-tab]");
  const secretPanel = document.getElementById("secretCollectionPanel");
  const recordPanel = document.getElementById("recordCollectionPanel");
  const secretList = document.getElementById("secretCollectionList");
  const secretCount = document.getElementById("secretCollectionCount");
  const secretProgress = document.getElementById("secretCollectionProgress");
  const secretProgressBar = document.getElementById(
  "secretCollectionProgressBar"
);
const secretProgressTrack = document.getElementById(
  "secretCollectionProgressBarTrack"
);

  const totalSecretCount = rareStrings.length;

  function renderSecrets() {
    const saveData = getSaveData();
    const discovered = new Set(saveData.discoveredSecrets ?? []);
    const discoveredCount = rareStrings.filter(
      (secret) => discovered.has(secret.text)
    ).length;

    secretCount.textContent =
      `${discoveredCount} / ${totalSecretCount}`;

    const percentage = Math.round(
      (discoveredCount / totalSecretCount) * 100
    );

    secretProgress.textContent = `${percentage}%`;
    secretProgressBar.style.width = `${percentage}%`;
    secretProgressTrack.setAttribute("aria-valuenow", String(percentage));

    secretList.replaceChildren();

    rareStrings.forEach((secret) => {
      const isDiscovered = discovered.has(secret.text);

      const card = document.createElement("article");
      card.className = "collection-secret-card";

      if (isDiscovered) {
        card.classList.add("discovered");

        if (secret.color === "purple") {
          card.classList.add("secret-purple");
        }

        if (secret.color === "gold") {
          card.classList.add("secret-gold");
        }
      }

      const number = document.createElement("div");
      number.className = "collection-secret-number";
      number.textContent = String(secret.number).padStart(2, "0");

      const info = document.createElement("div");
      info.className = "collection-secret-info";

      const name = document.createElement("h3");
      name.className = "collection-secret-name";
      name.textContent = isDiscovered ? secret.display : "？？？";

      const text = document.createElement("p");
      text.className = "collection-secret-text";
      text.textContent = isDiscovered
        ? secret.text
        : "まだ発見していないシークレット";

      const status = document.createElement("span");
      status.className = "collection-secret-status";
      status.textContent = isDiscovered ? "発見済み" : "未発見";

      info.append(name, text, status);
      card.append(number, info);
      secretList.appendChild(card);
    });
  }

  function renderRecords() {
    const saveData = getSaveData();

    const records = [
      {
        label: "累計シャッフル回数",
        value: saveData.totalShuffles ?? 0,
        icon: "🔀"
      },
      {
        label: "たんごむ完成回数",
        value: saveData.totalClears ?? 0,
        icon: "🎉"
      },
      {
        label: "Coins",
        value: saveData.coins ?? 0,
        icon: "🪙"
      },
      {
        label: "DOPA CHANCE突入回数",
        value: saveData.totalDopaChances ?? 0,
        icon: "✨"
      },
      {
        label: "シークレット発見数",
        value: `${new Set(saveData.discoveredSecrets ?? []).size} / ${totalSecretCount}`,
        icon: "📖"
      }
    ];

    const recordList = document.getElementById("playRecordList");
    recordList.replaceChildren();

    records.forEach((record) => {
      const card = document.createElement("article");
      card.className = "play-record-card";

      const icon = document.createElement("span");
      icon.className = "play-record-icon";
      icon.textContent = record.icon;

      const label = document.createElement("span");
      label.className = "play-record-label";
      label.textContent = record.label;

      const value = document.createElement("strong");
      value.className = "play-record-value";
      value.textContent = String(record.value);

      card.append(icon, label, value);
      recordList.appendChild(card);
    });
  }

  function refresh() {
    renderSecrets();
    renderRecords();
  }

  function selectTab(tabName) {
    const showSecrets = tabName === "secrets";

    secretPanel.hidden = !showSecrets;
    recordPanel.hidden = showSecrets;

    tabButtons.forEach((button) => {
      const selected = button.dataset.collectionTab === tabName;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
  }

  function openModal() {
    refresh();
    selectTab("secrets");
    modal.hidden = false;
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    openButton.focus();
  }

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectTab(button.dataset.collectionTab);
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  refresh();

  return { refresh };
}
