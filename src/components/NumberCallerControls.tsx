// Host-only controls for number calling (not sticky, not shown to non-hosts)
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { callNumberAction } from '@/server/actions/room';
import { useGameStore } from '@/stores/useGameStore';
import { RoomStatus } from '@prisma/client';
import { useCurPlayer } from '../hooks/useCurPlayer';
import React, { useRef, useState, useEffect } from 'react';
import { NumberAnnouncer } from './NumberAnnouncer';

export function NumberCallerControls() {
  const { room, addCalledNumber, calledNumbers } = useGameStore();
  const player = useCurPlayer();
  const isHost = player?.isHost;
  const isPlaying = room?.status === RoomStatus.playing;
  const [isAutoCallingActive, setIsAutoCallingActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoCallInterval, setAutoCallInterval] = useState<number>(5); // seconds
  const autoCallTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoCallTimerRef.current) {
        clearInterval(autoCallTimerRef.current);
        autoCallTimerRef.current = null;
      }
    };
  }, []);

  // Setup/clear auto-call
  useEffect(() => {
    if (autoCallTimerRef.current) {
      clearInterval(autoCallTimerRef.current);
      autoCallTimerRef.current = null;
    }
    if (isAutoCallingActive && isPlaying && isHost) {
      autoCallTimerRef.current = setInterval(handleCallNext, autoCallInterval * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoCallingActive, autoCallInterval, isPlaying, isHost]);

  // Only show to host
  if (!isHost || !isPlaying) return null;

  async function handleCallNext() {
    if (!isHost || !room || isLoading) return;
    if (room.status !== RoomStatus.playing) return;
    try {
      setIsLoading(true);
      const response = await callNumberAction(room.id);
      if (response.success && response.number) {
        addCalledNumber(response.number);
      }
    } catch (error) {
      console.log('🚀 ~ handleCallNext ~ error:', error);
      // Could add toast here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <span className="text-base font-semibold">Điều khiển gọi số của chủ xị</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button onClick={handleCallNext} disabled={isLoading || !isPlaying}>
            Gọi số tiếp theo
          </Button>
          <Switch checked={isAutoCallingActive} onCheckedChange={setIsAutoCallingActive} id="auto-call-toggle" />
          <Label htmlFor="auto-call-toggle">Tự động gọi số</Label>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="auto-call-interval">Khoảng cách (giây):</Label>
          <Slider
            id="auto-call-interval"
            min={2}
            max={15}
            step={1}
            value={[autoCallInterval]}
            onValueChange={([v]) => setAutoCallInterval(v)}
            className="w-32"
          />
          <span className="font-mono text-sm">{autoCallInterval}s</span>
        </div>
        <NumberAnnouncer number={calledNumbers.at(-1)} autoAnnounce={true} />
      </CardContent>
    </Card>
  );
}
