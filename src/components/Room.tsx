'use client';

import { useEffect } from 'react';
import { useGameStore, GameState } from '@/stores/useGameStore';
import { PlayerList } from '@/components/PlayerList';
import { CardSelection } from '@/components/CardSelection';
import { LoToCard } from '@/components/LoToCard';
import { NumberCaller } from '@/components/NumberCaller';
import { Button } from '@/components/ui/button';
import { RoomStatus } from '@prisma/client';
import {
  leaveRoomAction,
  updateRoomStatusAction,
  getRoomWithPlayersAction,
} from '@/server/actions/room';
import { useRoomRealtime } from '@/lib/supabase-subscribe';

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

  // Initial room data fetch (remains the same, adjusted dependencies and logging)
  useEffect(() => {
    if (!room || !player) {
      console.log('Room component: No room or player found, cannot fetch initial data.');
      // Consider redirecting or showing an error state
      return;
    }

    console.log('Room component: Fetching initial room data...');
    const fetchInitialRoomData = async () => {
      try {
        if (!room?.id) {
          console.error('Room component: Cannot fetch data without room ID.');
          // Maybe set an error state here if appropriate
          return;
        }

        const roomWithPlayers = await getRoomWithPlayersAction(room.id);

        // Guard Clause: Check for failure or missing room data first
        if (!roomWithPlayers.success || !roomWithPlayers.room) {
          console.error(
            'Room component: Failed to fetch initial room data - API error or missing room:',
            roomWithPlayers.error || 'No room data returned'
          );
          useGameStore.getState().setGameError('Failed to load room details.');
          return; // Exit early on failure
        }

        const currentStore = useGameStore.getState();

        // Update players state
        currentStore.setPlayersInRoom(roomWithPlayers.room.players || []);

        // update room state
        currentStore.setRoom(roomWithPlayers.room);
      } catch (error) {
        console.error(
          'Room component: Failed to fetch initial room data - Network/unexpected error:',
          error
        );
        useGameStore
          .getState()
          .setGameError('An unexpected error occurred while loading room details.');
      }
    };

    fetchInitialRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentional: only refetch on ID change
  }, [room?.id, player?.id]); // Reduced dependencies

  // Use the custom hook to manage realtime subscriptions
  useRoomRealtime(room?.id);

  if (!room || !player) {
    return <div className="container mx-auto p-4">Loading room details...</div>;
  }

  const isHost = player.isHost;
  const isWaiting = room.status === RoomStatus.waiting;
  const isPlaying = room.status === RoomStatus.playing;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mã phòng: {room.code}</h1>
        <Button variant="outline" onClick={handleLeaveRoom}>
          Thoát
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
                Chia sẻ mã phòng với bạn bè:{' '}
                <span className="font-bold">{room.code}</span>
              </p>
              <Button onClick={handleStartGame}>Bắt đầu trò chơi</Button>
            </div>
          )}

          {isWaiting && !isHost && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Chờ chủ xị</h2>
              <p>Chủ xị sẽ bắt đầu trò chơi khi tất cả mọi người đã chọn bảng.</p>
            </div>
          )}

          {isWaiting && <CardSelection />}

          {isPlaying && player.cardId && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Bảng của bạn</h2>
              <LoToCard cardId={player.cardId} playable={true} />
            </div>
          )}

          {isPlaying && <NumberCaller />}
        </div>
      </div>
    </div>
  );
}
