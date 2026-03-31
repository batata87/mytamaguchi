"use client";

export async function triggerSchoolPrideBurst() {
  const confettiModule = await import("canvas-confetti");
  const confetti = confettiModule.default;
  const end = Date.now() + 900;

  const colors = ["#FFD166", "#F4A261", "#E76F51", "#9D4EDD", "#4CC9F0"];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
