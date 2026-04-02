/**
 * Very light vibration patterns for mobile — heartbeat / soft purr feel.
 * No-op when Vibration API is unavailable (desktop, iOS limitations).
 */
export function playPetPurrHaptic(): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  try {
    navigator.vibrate([6, 14, 5, 12, 4]);
  } catch {
    // ignored
  }
}
