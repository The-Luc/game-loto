'use client';

import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { readNumberInVietnamese } from '@/lib/game-utils';
import { RoomStatus } from '@prisma/client';

export function NumberCaller() {
  const { gameState, callNextNumber, toggleAutoCall, isAutoCallingActive } = useGame();
  const { room, player } = gameState;

  const isHost = player?.isHost;

  // Read the current number when it changes
  useEffect(() => {
    const calledNumbers = room?.calledNumbers || [];
    if (calledNumbers.length > 0) {
      const lastNumber = calledNumbers[calledNumbers.length - 1];
      readNumberInVietnamese(lastNumber);
    }
  }, [room?.calledNumbers]);

  if (!room || !player || room.status !== RoomStatus.playing) return null;

  const currentNumber = room.calledNumbers[room.calledNumbers.length - 1] || null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Number Caller</h2>

      {currentNumber && (
        <div className="mb-4">
          <div className="text-6xl font-bold text-center p-4 bg-yellow-100 rounded-lg">
            {currentNumber}
          </div>
        </div>
      )}

      {isHost && (
        <div className="flex flex-col space-y-2">
          <Button onClick={callNextNumber} disabled={isAutoCallingActive}>
            Call Next Number
          </Button>

          <Button
            variant={isAutoCallingActive ? 'destructive' : 'outline'}
            onClick={toggleAutoCall}
          >
            {isAutoCallingActive ? 'Stop Auto-Calling' : 'Start Auto-Calling (5s)'}
          </Button>
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Called Numbers</h3>
        <div className="flex flex-wrap gap-2">
          {room.calledNumbers?.map(number => (
            <span key={number} className="inline-block px-2 py-1 bg-gray-100 rounded">
              {number}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
