import React, { useEffect, useState } from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface NumberAnnouncerProps {
  number?: number;
  onAnnouncementComplete?: () => void;
  autoAnnounce?: boolean;
}

/**
 * Component that announces numbers in Vietnamese using text-to-speech
 * Can be set to automatically announce when a new number is provided
 * or manually triggered by the user
 */
export function NumberAnnouncer({ number, onAnnouncementComplete, autoAnnounce = true }: NumberAnnouncerProps) {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [lastAnnouncedNumber, setLastAnnouncedNumber] = useState<number | undefined>();

  // Automatically announce when a new number is provided
  useEffect(() => {
    const shouldAnnounce = autoAnnounce && number !== undefined && number !== lastAnnouncedNumber;

    if (shouldAnnounce) {
      announceNumber();
    }
  }, [number, autoAnnounce]);

  // Announce the current number
  const announceNumber = async () => {
    console.log('🚀 ~ announceNumber ~ number:', number);
    if (number === undefined) return;

    try {
      await speak(number);
      setLastAnnouncedNumber(number);
      onAnnouncementComplete?.();
    } catch (error) {
      console.error('Error announcing number:', error);
    }
  };
  return;

  return (
    <div className="flex items-center gap-2">
      {number && (
        <Button
          variant="outline"
          size="sm"
          onClick={isSpeaking ? stop : announceNumber}
          disabled={number === undefined}
          className="flex items-center gap-2"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Announce Number
            </>
          )}
        </Button>
      )}
    </div>
  );
}
