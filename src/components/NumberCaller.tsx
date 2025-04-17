'use client';

import { useEffect, useState } from 'react'; 
import { useGameStore } from '@/stores/useGameStore'; 
import { Button } from '@/components/ui/button';
import { readNumberInVietnamese } from '@/lib/game-utils';
import { RoomStatus } from '@prisma/client';
// TODO: Import server actions for callNextNumber, toggleAutoCall, startOver when implemented

export function NumberCaller() {
  // Get state from Zustand store
  const { room, player, calledNumbers } = useGameStore();

  // Local state for UI elements like auto-call toggle
  const [isAutoCallingActive, setIsAutoCallingActive] = useState(false); // Placeholder
  const [isLoading, setIsLoading] = useState(false); // For async actions

  const isHost = player?.isHost;
  const isPlaying = room?.status === RoomStatus.playing;
  const isEnded = room?.status === RoomStatus.ended;
  const winnerNickname = useGameStore(state => state.winner?.nickname); // Get winner nickname if available

  // Read the current number when it changes
  useEffect(() => {
    if (calledNumbers.length > 0) {
      const lastNumber = calledNumbers[calledNumbers.length - 1];
      readNumberInVietnamese(lastNumber);
    }
  }, [calledNumbers]);

  // Hide component if not playing or no room/player
  if (!room || !player || (!isPlaying && !isEnded)) return null;

  const currentNumber = calledNumbers[calledNumbers.length - 1] || null;

  // --- Action Handlers (Require Server Actions) ---
  const handleCallNext = async () => {
    if (!isHost || !room) return;
    setIsLoading(true);
    console.log('TODO: Call server action to get next number for room:', room.id);
    // Example (replace with actual action call):
    // const response = await callNextNumberAction(room.id);
    // if (response.success && response.number) {
    //   useGameStore.getState().addCalledNumber(response.number);
    //   // Potentially update room status/winner from response too
    // } else {
    //   // Handle error
    // }
    setIsLoading(false);
  };

  const handleToggleAutoCall = () => {
    if (!isHost || !room) return;
    setIsLoading(true);
    const newAutoCallState = !isAutoCallingActive;
    console.log('TODO: Call server action to toggle auto-call for room:', room.id, newAutoCallState);
    // Example (replace with actual action call):
    // const response = await toggleAutoCallAction(room.id, newAutoCallState);
    // if (response.success) {
    //   setIsAutoCallingActive(newAutoCallState);
    // } else {
    //   // Handle error
    // }
    // For now, just toggle local state for UI testing
    setIsAutoCallingActive(newAutoCallState);
    setIsLoading(false);
  };

  const handleStartOver = async () => {
    if (!isHost || !room) return;
    setIsLoading(true);
    console.log('TODO: Call server action to reset game/start over for room:', room.id);
    // Example (replace with actual action call):
    // const response = await startNewGameAction(room.id);
    // if (response.success) {
    //   // Store should be updated via real-time subscription or response
    // } else {
    //   // Handle error
    // }
    setIsLoading(false);
  };
  // --------------------------------------------------

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Number Caller</h2>

      {/* Display Current Number */}
      {isPlaying && currentNumber !== null && (
        <div className="mb-4">
          <p className="text-sm text-center text-gray-500 mb-1">Last Called Number:</p>
          <div className="text-6xl font-bold text-center p-4 bg-yellow-100 rounded-lg">
            {currentNumber}
          </div>
        </div>
      )}

      {/* Display Winner Info */}
      {isEnded && winnerNickname && (
        <div className="mb-4 text-center p-4 bg-green-100 rounded-lg">
          <p className="text-2xl font-bold text-green-700">🎉 Winner: {winnerNickname}! 🎉</p>
        </div>
      )}

      {/* Host Controls */}
      {isHost && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          {!isEnded && (
            <>
              <Button onClick={handleCallNext} disabled={isLoading || isAutoCallingActive}>
                Call Next Number
              </Button>
              <Button variant="outline" onClick={handleToggleAutoCall} disabled={isLoading}>
                {isAutoCallingActive ? 'Stop Auto-Call' : 'Start Auto-Call'}
              </Button>
            </>
          )}
          {isEnded && (
            <Button onClick={handleStartOver} disabled={isLoading}>
              Start New Game
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
