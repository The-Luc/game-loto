/**
 * Vietnamese speech synthesis for Lô Tô number calling
 * This utility uses the Web Speech API with appropriate fallbacks for
 * cross-browser support of Vietnamese text-to-speech.
 */

// Map of numbers to their Vietnamese pronunciation
export const vietnameseNumbers: Record<number, string> = {
  1: 'Số một',
  2: 'Số hai',
  3: 'Số ba',
  4: 'Số bốn',
  5: 'Số năm',
  6: 'Số sáu',
  7: 'Số bảy',
  8: 'Số tám',
  9: 'Số chín',
  10: 'Số mười',
  11: 'Số mười một',
  12: 'Số mười hai',
  13: 'Số mười ba',
  14: 'Số mười bốn',
  15: 'Số mười lăm',
  16: 'Số mười sáu',
  17: 'Số mười bảy',
  18: 'Số mười tám',
  19: 'Số mười chín',
  20: 'Số hai mươi',
  21: 'Số hai mươi mốt',
  22: 'Số hai mươi hai',
  23: 'Số hai mươi ba',
  24: 'Số hai mươi bốn',
  25: 'Số hai mươi lăm',
  26: 'Số hai mươi sáu',
  27: 'Số hai mươi bảy',
  28: 'Số hai mươi tám',
  29: 'Số hai mươi chín',
  30: 'Số ba mươi',
  31: 'Số ba mươi mốt',
  32: 'Số ba mươi hai',
  33: 'Số ba mươi ba',
  34: 'Số ba mươi bốn',
  35: 'Số ba mươi lăm',
  36: 'Số ba mươi sáu',
  37: 'Số ba mươi bảy',
  38: 'Số ba mươi tám',
  39: 'Số ba mươi chín',
  40: 'Số bốn mươi',
  41: 'Số bốn mươi mốt',
  42: 'Số bốn mươi hai',
  43: 'Số bốn mươi ba',
  44: 'Số bốn mươi bốn',
  45: 'Số bốn mươi lăm',
  46: 'Số bốn mươi sáu',
  47: 'Số bốn mươi bảy',
  48: 'Số bốn mươi tám',
  49: 'Số bốn mươi chín',
  50: 'Số năm mươi',
  51: 'Số năm mươi mốt',
  52: 'Số năm mươi hai',
  53: 'Số năm mươi ba',
  54: 'Số năm mươi bốn',
  55: 'Số năm mươi lăm',
  56: 'Số năm mươi sáu',
  57: 'Số năm mươi bảy',
  58: 'Số năm mươi tám',
  59: 'Số năm mươi chín',
  60: 'Số sáu mươi',
  61: 'Số sáu mươi mốt',
  62: 'Số sáu mươi hai',
  63: 'Số sáu mươi ba',
  64: 'Số sáu mươi bốn',
  65: 'Số sáu mươi lăm',
  66: 'Số sáu mươi sáu',
  67: 'Số sáu mươi bảy',
  68: 'Số sáu mươi tám',
  69: 'Số sáu mươi chín',
  70: 'Số bảy mươi',
  71: 'Số bảy mươi mốt',
  72: 'Số bảy mươi hai',
  73: 'Số bảy mươi ba',
  74: 'Số bảy mươi bốn',
  75: 'Số bảy mươi lăm',
  76: 'Số bảy mươi sáu',
  77: 'Số bảy mươi bảy',
  78: 'Số bảy mươi tám',
  79: 'Số bảy mươi chín',
  80: 'Số tám mươi',
  81: 'Số tám mươi mốt',
  82: 'Số tám mươi hai',
  83: 'Số tám mươi ba',
  84: 'Số tám mươi bốn',
  85: 'Số tám mươi lăm',
  86: 'Số tám mươi sáu',
  87: 'Số tám mươi bảy',
  88: 'Số tám mươi tám',
  89: 'Số tám mươi chín',
  90: 'Số chín mươi',
};

// Store speech synthesis instance to avoid reinitializing
let speechSynthesis: SpeechSynthesis | null = null;
let vietnameseVoice: SpeechSynthesisVoice | null = null;

// Track whether we're using audio file fallback
let useAudioFallback = false;

// Audio players cache to avoid recreating Audio objects
const audioPlayers: Record<number, HTMLAudioElement> = {};

/**
 * Initialize the speech synthesis engine and try to find a Vietnamese voice
 * Falls back to audio files if no Vietnamese voice is available
 */
export const initSpeechSynthesis = (): boolean => {
  // Check for browser support
  if (!('speechSynthesis' in window)) {
    console.warn('This browser does not support speech synthesis.');
    useAudioFallback = true;
    return true; // Return true as we'll use audio fallback
  }

  speechSynthesis = window.speechSynthesis;

  // Load available voices
  const loadVoices = () => {
    const voices = speechSynthesis?.getVoices() || [];

    // Try to find a Vietnamese voice
    vietnameseVoice =
      voices.find(
        (voice) =>
          voice.lang === 'vi-VN' || // Standard Vietnamese
          voice.lang.startsWith('vi') // Any Vietnamese dialect
      ) || null;

    if (!vietnameseVoice) {
      console.warn('No Vietnamese voice found, will use audio file fallback.');
      useAudioFallback = true;
    }

    return true; // Always return true as we have a fallback now
  };

  // Chrome loads voices asynchronously
  if (speechSynthesis?.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Initial load attempt
  return loadVoices();
};

/**
 * Play a number from an audio file
 * @param number The number to play (1-90)
 * @param callback Optional callback to run after audio is completed
 */
const playNumberAudio = (number: number, callback?: () => void): void => {
  // Get or create audio player for this number
  if (!audioPlayers[number]) {
    const numberName = number.toString().padStart(3, '0');
    audioPlayers[number] = new Audio(`/audio/vietnamese-numbers/loto-sound_${numberName}.wav`);
  }

  const player = audioPlayers[number];

  // Set up event handlers
  const handleEnd = () => {
    player.removeEventListener('ended', handleEnd);
    player.removeEventListener('error', handleError);
    callback?.();
  };

  const handleError = (e: Event) => {
    console.error(`Error playing audio for number ${number}:`, e);
    player.removeEventListener('ended', handleEnd);
    player.removeEventListener('error', handleError);
    callback?.();
  };

  // Reset and add event listeners
  player.currentTime = 0;
  player.addEventListener('ended', handleEnd);
  player.addEventListener('error', handleError);

  // Start playback
  player.play().catch((error) => {
    console.error('Audio playback failed:', error);
    callback?.();
  });
};

/**
 * Speaks a number in Vietnamese
 * @param number The number to speak (1-90)
 * @param callback Optional callback to run after speech is completed
 */
export const speakVietnameseNumber = (number: number, callback?: () => void): void => {
  // Validate number range
  if (number < 1 || number > 90) {
    console.error('Number must be between 1 and 90');
    callback?.();
    return;
  }

  playNumberAudio(number, callback);
};

/**
 * Check if the browser supports the Web Speech API
 */
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Get all available voices
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!speechSynthesis) {
    initSpeechSynthesis();
  }
  return speechSynthesis?.getVoices() || [];
};

/**
 * Stop any ongoing speech
 */
export const stopSpeech = (): void => {
  speechSynthesis?.cancel();
};
