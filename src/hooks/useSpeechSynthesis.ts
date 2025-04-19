'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initSpeechSynthesis,
  speakVietnameseNumber,
  isSpeechSynthesisSupported,
  stopSpeech,
} from '@/lib/speech';

interface UseSpeechSynthesisReturn {
  speak: (number: number) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * Custom hook for Vietnamese text-to-speech synthesis
 * Handles initialization and provides methods for speaking Vietnamese numbers
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true); // Assume supported initially
  const initializedRef = useRef(false);

  // Initialize speech synthesis on mount
  useEffect(() => {
    // Check support and initialize
    const isSupported = isSpeechSynthesisSupported();
    setIsSupported(isSupported);

    if (isSupported && !initializedRef.current) {
      initSpeechSynthesis();
      initializedRef.current = true;
    }

    return () => {
      // Clean up any ongoing speech when component unmounts
      stopSpeech();
    };
  }, []);

  // Function to speak a number
  const speak = useCallback(
    (number: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!isSupported) {
          console.warn('Speech synthesis is not supported in this browser');
          resolve();
          return;
        }

        setIsSpeaking(true);

        speakVietnameseNumber(number, () => {
          setIsSpeaking(false);
          resolve();
        });
      });
    },
    [isSupported]
  );

  // Function to stop speaking
  const stop = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
