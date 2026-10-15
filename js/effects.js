
export function launchConfetti(confettiEl) {
  const colors = [
    "#ff4d6d", "#ffd166", "#06d6a0",
    "#4dabf7", "#9b5de5", "#ff85c1"
  ];

  confettiEl.replaceChildren();

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay =
      Math.random() * 1.5 + "s";
    piece.style.animationDuration =
      (2.5 + Math.random() * 2) + "s";
    piece.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    confettiEl.appendChild(piece);
  }
}

