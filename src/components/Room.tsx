'use client';

import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { PlayerList } from '@/components/PlayerList';
import { CardSelection } from '@/components/CardSelection';
import { LoToCard } from '@/components/LoToCard';
import { NumberCaller } from '@/components/NumberCaller';
import { Button } from '@/components/ui/button';
import { RoomStatus } from '@prisma/client';

export function Room() {
  const { gameState, leaveRoom, startGame } = useGame();
  const { room, player } = gameState;
  console.log('🚀 ~ Room i~ room:', room);

  // Redirect if no room or player
  useEffect(() => {
    if (!room || !player) {
      // In a real app, we would redirect to the home page
      // For now, we'll just log a message
      console.log('No room or player found');
    }
  }, [room, player]);

  if (!room || !player) return null;

  const isHost = player.isHost;
  const isWaiting = room.status === RoomStatus.waiting;
  const isSelecting = room.status === RoomStatus.selecting;
  const isPlaying = room.status === RoomStatus.playing;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room: {room.code}</h1>
        <Button variant="outline" onClick={leaveRoom}>
          Leave Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Player list */}
        <div>
          <PlayerList />
        </div>

        {/* Middle column - Game area */}
        <div className="md:col-span-2">
          {isWaiting && isHost && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Waiting for Players</h2>
              <p className="mb-4">
                Share this code with your friends:{' '}
                <span className="font-bold">{room.code}</span>
              </p>
              <Button onClick={startGame}>Start Game</Button>
            </div>
          )}

          {isWaiting && !isHost && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Waiting for Host</h2>
              <p>The host will start the game when everyone is ready.</p>
            </div>
          )}

          {isSelecting && <CardSelection />}

          {isPlaying && player.cardId && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Your Card</h2>
              <LoToCard cardId={player.cardId} playable={true} />
            </div>
          )}

          {isPlaying && <NumberCaller />}
        </div>
      </div>
    </div>
  );
}
