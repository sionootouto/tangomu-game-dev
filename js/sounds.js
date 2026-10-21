
const soundFiles = {
  button: "../sounds/tap.mp3",
  clear: "../sounds/clear.mp3",
  secret: "../sounds/secret.mp3",
  chance: "../sounds/chance.mp3",
  superChance: "../sounds/superchance.mp3",
  hyperChance: "../sounds/hyperchance.mp3",
  chanceMiss: "../sounds/chance-miss.mp3",
  
  breakChopsticks: "../sounds/break-chopsticks.mp3",
  eatingChopsticks: "../sounds/eating-chopsticks.mp3",
  gachaSuka: "../sounds/gacha-suka.mp3",
  gachaCollect: "../sounds/gacha-collect.mp3",

  // DOPA CHANCE専用音源
  dopaEnter: "../sounds/dopa-enter.mp3",
  dopaBgm: "../sounds/dopa-chance.mp3"
};

const AudioContextClass =
  window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioContextClass();
const audioBuffers = {};

let loadingPromise = null;
let dopaBgmSource = null;
let dopaBgmGain = null;

// 音声を先に読み込んでおく
function loadSounds() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = Promise.all(
    Object.entries(soundFiles).map(async ([name, path]) => {
      const response = await fetch(new URL(path, import.meta.url));

      if (!response.ok) {
        throw new Error(`音声を読み込めません: ${path}`);
      }

      const data = await response.arrayBuffer();
      audioBuffers[name] = await audioContext.decodeAudioData(data);
    })
  ).catch((error) => {
    loadingPromise = null;
    console.error("音声の読み込みに失敗しました", error);
    throw error;
  });

  return loadingPromise;
}

loadSounds().catch(() => {});

// 通常の効果音を再生（重ねて再生可能）
export function playSE(name) {
  const buffer = audioBuffers[name];

  if (!buffer) {
    console.warn(`効果音の読み込み中、または未登録です: ${name}`);
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  source.connect(gain);
  gain.connect(audioContext.destination);

  source.start(0);
}

// DOPA CHANCE中のBGMをループ再生

export async function startDopaBGM() {
  try {
    await loadSounds();

    const buffer = audioBuffers.dopaBgm;

    if (!buffer || dopaBgmSource) return;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    dopaBgmSource = audioContext.createBufferSource();
    dopaBgmGain = audioContext.createGain();

    dopaBgmSource.buffer = buffer;
    dopaBgmSource.loop = true;
    dopaBgmGain.gain.value = 0.65;

    dopaBgmSource.connect(dopaBgmGain);
    dopaBgmGain.connect(audioContext.destination);

    dopaBgmSource.onended = () => {
      dopaBgmSource = null;
      dopaBgmGain = null;
    };

    dopaBgmSource.start(0);
  } catch (error) {
    console.error("DOPA CHANCEのBGMを再生できませんでした", error);
  }
}


// DOPA CHANCEのBGMだけを停止
export function stopDopaBGM() {
  if (dopaBgmSource) {
    const source = dopaBgmSource;

    dopaBgmSource = null;
    dopaBgmGain = null;

    source.onended = null;
    source.stop();
  }
}
