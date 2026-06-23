// speech.ts - Web Speech API synthesis utility

let speechEnabled = false;

export const setSpeechEnabled = (enabled: boolean) => {
  speechEnabled = enabled;
  if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const getSpeechEnabled = () => {
  return speechEnabled;
};

export const speak = (text: string, _priority?: boolean) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  if (!speechEnabled) return;

  // Cancel any ongoing speech to speak immediately
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID'; // Set to Indonesian
  utterance.rate = 1.0;     // Standard speed
  utterance.pitch = 1.0;    // Standard pitch

  window.speechSynthesis.speak(utterance);
};
