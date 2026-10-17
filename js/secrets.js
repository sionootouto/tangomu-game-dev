// ========================================
// シークレット機能
// ========================================

// シークレットの状態を作成
export function createSecretState() {
  return {
    active: false,
    current: null,
    step: 0,
    isDebug: false
  };
}

// ========================================
// シークレット開始
// ========================================

export function startSecret(
  state,
  rareString,
  isDebug = false
) {
  state.active = true;
  state.current = rareString;
  state.step = 1;
  state.isDebug = isDebug;
}

// ========================================
// シークレットの進行
// ========================================

export function advanceSecret(state) {
  if (!state.active || !state.current) {
    throw new Error(
      "進行中のシークレットがありません。"
    );
  }

  const secret = state.current;
  const isDebug = state.isDebug;

  const letter = secret.text[state.step];

  state.step++;

  return {
    letter,
    completed: state.step >= secret.text.length,
    secret,
    isDebug
  };
}

// ========================================
// シークレットの文字色
// ========================================

export function getSecretColorClass(state) {
  if (!state.active || !state.current) {
    return null;
  }

  if (state.current.color === "purple") {
    return "rare-purple";
  }

  if (state.current.color === "gold") {
    return "rare-gold";
  }

  return null;
}

// ========================================
// シークレット完成時の表示文
// ========================================

export function getSecretCompletionText(secret) {
  return `${secret.display} シークレット${secret.number}/10`;
}

// ========================================
// シークレット発見の記録
// ========================================

export function recordSecretDiscovery(
  secret,
  { saveData, persistSave, updateAchievements, rewardCoins }
) {
  const isFirstDiscovery =
    !saveData.discoveredSecrets.includes(secret.text);

  if (isFirstDiscovery) {
    saveData.discoveredSecrets.push(secret.text);
  }

  rewardCoins(secret, isFirstDiscovery);
  persistSave();
  updateAchievements();

  return isFirstDiscovery;
}

// ========================================
// シークレット状態のリセット
// ========================================

export function resetSecret(state) {
  state.active = false;
  state.current = null;
  state.step = 0;
  state.isDebug = false;
}
