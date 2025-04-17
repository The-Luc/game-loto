'use client';

import { useEffect } from 'react';
import { useGameStore, GameState } from '@/stores/useGameStore';
import { PlayerList } from '@/components/PlayerList';
import { CardSelection } from '@/components/CardSelection';
import { LoToCard } from '@/components/LoToCard';
import { NumberCaller } from '@/components/NumberCaller';
import { Button } from '@/components/ui/button';
import { RoomStatus } from '@prisma/client';
import { leaveRoomAction, updateRoomStatusAction } from '@/server/actions/room';

export function Room() {
  const room = useGameStore((state: GameState) => state.room);
  const player = useGameStore((state: GameState) => state.player);

  const handleLeaveRoom = async () => {
    if (room && player) {
      try {
        await leaveRoomAction(room.id, player.id);
      } catch (error) {
        console.error('Failed to leave room:', error);
        useGameStore.getState().setGameError('Failed to leave room');
      }
    }
  };

  const handleStartGame = async () => {
    if (room && player?.isHost) {
      try {
        await updateRoomStatusAction(room.id, RoomStatus.playing);
      } catch (error) {
        console.error('Failed to start game:', error);
        useGameStore.getState().setGameError('Failed to start game');
      }
    }
  };

  useEffect(() => {
    if (!room || !player) {
      console.log('No room or player found, potentially redirecting...');
    }
  }, [room, player]);

  if (!room || !player) {
    return <div>Loading room details...</div>;
  }

  const isHost = player.isHost;
  const isWaiting = room.status === RoomStatus.waiting;
  const isPlaying = room.status === RoomStatus.playing;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room: {room.code}</h1>
        <Button variant="outline" onClick={handleLeaveRoom}>
          Leave Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <PlayerList />
        </div>

        <div className="md:col-span-2">
          {isWaiting && isHost && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <p className="mb-4">
                Share this code with your friends:{' '}
                <span className="font-bold">{room.code}</span>
              </p>
              <Button onClick={handleStartGame}>Start Game</Button>
            </div>
          )}

          {isWaiting && !isHost && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Waiting for Host</h2>
              <p>The host will start the game when everyone is ready.</p>
            </div>
          )}

          {isWaiting && <CardSelection />}

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
