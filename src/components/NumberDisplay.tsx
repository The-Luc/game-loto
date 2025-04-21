// Compact sticky display for current and called numbers (no controls)
'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/stores/useGameStore';
import { RoomStatus } from '@prisma/client';
import React from 'react';

export function NumberDisplay() {
  const { calledNumbers, room } = useGameStore();
  const isPlaying = room?.status === RoomStatus.playing;
  const isEnded = room?.status === RoomStatus.ended;

  // Hide if not playing or ended
  if (!isPlaying && !isEnded) return null;

  if (!calledNumbers.length) return;

  const reverseCalledNumbers = [...calledNumbers].reverse();

  return (
    <Card className="w-full shadow bg-background/95 p-2">
      <CardContent className="p-0">
        <div className="flex flex-row gap-1 overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/30">
          {reverseCalledNumbers.map((num, i) => (
            <Badge
              key={num + '-' + i}
              variant={i === 0 ? 'default' : 'outline'}
              className={
                'text-base px-2 py-1 min-w-[32px] justify-center' +
                (i === 0 ? ' bg-primary text-white font-bold' : '')
              }
            >
              {num}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
