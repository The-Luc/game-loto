'use client';

import { useEffect, useState } from 'react';
import { useGameStore, GameState } from '@/stores/useGameStore';
import { useCurPlayer } from '@/hooks/useCurPlayer';
import { PlayerList } from '@/components/PlayerList';
import { CardSelection } from '@/components/CardSelection';
import { LoToCard } from '@/components/LoToCard';
import { NumberCaller } from '@/components/NumberCaller';
import { WinModal } from '@/components/WinModal';
import { Button } from '@/components/ui/button';
import { RoomStatus } from '@prisma/client';
import {
  leaveRoomAction,
  updateRoomStatusAction,
  getRoomWithPlayersAction,
} from '@/server/actions/room';
import { useRoomRealtime } from '@/lib/supabase-subscribe';
import { subscribe } from '@/lib/supabase';
import { RealtimeEventEnum } from '@/lib/enums';
import { cardTemplates } from '../lib/card-template';
import { LoToCardType } from '../lib/types';

export function Room() {
  const room = useGameStore((state: GameState) => state.room);
  const curPlayer = useCurPlayer();
  
  // State for win modal
  const [showWinModal, setShowWinModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{
    name: string;
    cardId: string;
    winningRowIndex: number;
  } | null>(null);

  const handleLeaveRoom = async () => {
    if (room && curPlayer) {
      try {
        await leaveRoomAction(room.id, curPlayer.id);
      } catch (error) {
        console.error('Failed to leave room:', error);
        useGameStore.getState().setGameError('Failed to leave room');
      }
    }
  };

  const handleStartGame = async () => {
    if (room && curPlayer?.isHost) {
      try {
        await updateRoomStatusAction(room.id, RoomStatus.playing);
      } catch (error) {
        console.error('Failed to start game:', error);
        useGameStore.getState().setGameError('Failed to start game');
      }
    }
  };

  const handlePlayAgain = async () => {
    if (room && curPlayer?.isHost) {
      try {
        await updateRoomStatusAction(room.id, RoomStatus.waiting);
        setShowWinModal(false);
        setWinnerInfo(null);
      } catch (error) {
        console.error('Failed to restart game:', error);
        useGameStore.getState().setGameError('Failed to restart game');
      }
    }
  };

  // Initial room data fetch (remains the same, adjusted dependencies and logging)
  useEffect(() => {
    if (!room || !curPlayer) {
      console.log(
        'Room component: No room or player found, cannot fetch initial data.'
      );
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
          .setGameError(
            'An unexpected error occurred while loading room details.'
          );
      }
    };

    fetchInitialRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentional: only refetch on ID change
  }, [room?.id, curPlayer?.id]); // Reduced dependencies

  // Use the custom hook to manage realtime subscriptions
  useRoomRealtime(room?.id);

  // Subscribe to winner declaration events
  useEffect(() => {
    if (!room?.id) return;
    
    // Subscribe to winner declared events
    const unsubscribe = subscribe(
      room.id,
      RealtimeEventEnum.WINNER_DECLARED,
      (payload) => {
        console.log('Winner declared event received:', payload);
        // When a winner is declared, update state to show modal
        setWinnerInfo({
          name: payload.winnerName,
          cardId: payload.cardId,
          winningRowIndex: payload.winningRowIndex
        });
        setShowWinModal(true);
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [room?.id]);

  if (!room || !curPlayer) {
    return <div className="container mx-auto p-4">Loading room details...</div>;
  }

  const getCardById = (cardId: string) => {
    return (
      cardTemplates.find((c) => c.id === cardId) ||
      ([] as unknown as LoToCardType)
    );
  };

  const isHost = curPlayer.isHost;
  const isWaiting = room.status === RoomStatus.waiting;
  const isPlaying = room.status === RoomStatus.playing;
  console.log('🚀 ~ Room ~ isPlaying:', isPlaying);
  console.log('🚀 ~ Room ~ player:', curPlayer);

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
              <p>
                Chủ xị sẽ bắt đầu trò chơi khi tất cả mọi người đã chọn bảng.
              </p>
            </div>
          )}

          {isWaiting && <CardSelection />}

          {isPlaying && curPlayer.selectedCardIds.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Bảng của bạn</h2>
              <div>
                {curPlayer.selectedCardIds.map((cardId) => (
                  <LoToCard
                    key={cardId}
                    card={getCardById(cardId)}
                    playable={true}
                  />
                ))}
              </div>
            </div>
          )}

          {isPlaying && !room.winnerId && <NumberCaller />}
          {isPlaying && room.winnerId && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-2">Trò chơi kết thúc!</h2>
                <p>Người chiến thắng đã được xác định</p>
              </div>
              {curPlayer?.isHost && (
                <Button onClick={handlePlayAgain} className="w-full">Chơi lại</Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && winnerInfo && (
        <WinModal
          isOpen={showWinModal}
          onCloseAction={() => setShowWinModal(false)}
          winnerName={winnerInfo.name}
          winningCard={getCardById(winnerInfo.cardId)}
          winningRowIndex={winnerInfo.winningRowIndex}
        />
      )}
    </div>
  );
}
