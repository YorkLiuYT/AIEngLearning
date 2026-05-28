/**
 * Web Speech API wrapper for TTS pronunciation.
 * Uses browser's built-in SpeechSynthesis when available.
 * Falls back to ResponsiveVoice.js for browsers without SpeechSynthesis (LINE, etc.).
 */

const VOICE_KEY = 'ttsVoice';

export function getVoicePref() {
  return localStorage.getItem(VOICE_KEY) || 'auto';
}

export function setVoicePref(voice) {
  localStorage.setItem(VOICE_KEY, voice);
}

/**
 * Speak text using browser TTS or ResponsiveVoice fallback.
 */
export function speak(text) {
  return new Promise((resolve, reject) => {
    // Try browser SpeechSynthesis first
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const pref = getVoicePref();
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v => v.lang.startsWith(pref === 'auto' ? 'en' : pref));
        if (preferred) {
          utterance.voice = preferred;
        } else {
          const enVoice = voices.find(v => v.lang.startsWith('en'));
          if (enVoice) utterance.voice = enVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => {
        // Fall through to ResponsiveVoice if browser TTS fails
        responsiveFallback(text, resolve, reject);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // No SpeechSynthesis — use ResponsiveVoice
      responsiveFallback(text, resolve, reject);
    }
  });
}

function responsiveFallback(text, resolve, reject) {
  // Wait for ResponsiveVoice to be loaded
  if (!window.responsiveVoice) {
    reject(new Error('ResponsiveVoice not loaded'));
    return;
  }
  window.responsiveVoice.speak(text, 'US English Female', {
    onend: resolve,
    onerror: reject,
  });
}

export function isSpeechSupported() {
  return !!window.speechSynthesis || !!window.responsiveVoice;
}
