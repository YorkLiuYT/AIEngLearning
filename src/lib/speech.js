/**
 * Web Speech API wrapper for TTS pronunciation.
 * Uses browser's built-in SpeechSynthesis — no API keys needed.
 */

// Voice preference: 'en-US' (American), 'en-GB' (British), 'auto' (system default)
const VOICE_KEY = 'ttsVoice';

export function getVoicePref() {
  return localStorage.getItem(VOICE_KEY) || 'auto';
}

export function setVoicePref(voice) {
  localStorage.setItem(VOICE_KEY, voice);
}

/**
 * Speak a word or phrase using the browser's TTS engine.
 * Returns a promise that resolves when speech ends (or rejects if unsupported).
 */
export function speak(text) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('SpeechSynthesis not supported'));
      return;
    }

    // Cancel any ongoing speech to avoid overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try to find a matching voice
    const pref = getVoicePref();
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer a voice matching the user's preference
      const preferred = voices.find(v => v.lang.startsWith(pref === 'auto' ? 'en' : pref));
      if (preferred) {
        utterance.voice = preferred;
      } else {
        // Fall back to first available English voice
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Check if the browser supports speech synthesis.
 */
export function isSpeechSupported() {
  return !!window.speechSynthesis;
}
