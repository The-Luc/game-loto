'use client';

import { CardSelection } from '@/components/CardSelection';
import { LoToCard } from '@/components/LoToCard';
import { NumberDisplay } from '@/components/NumberDisplay';
import { NumberCallerControls } from '@/components/NumberCallerControls';
import { PlayerList } from '@/components/PlayerList';
import { WinModal } from '@/components/WinModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCurPlayer } from '@/hooks/useCurPlayer';
import { cardTemplates } from '@/lib/card-template';
import { useRoomRealtime } from '@/lib/supabase-subscribe';
import { LoToCardType } from '@/lib/types';
import {
  callNumberAction,
  getRoomWithPlayersAction,
  leaveRoomAction,
  updateRoomStatusAction,
} from '@/server/actions/room';
import { GameState, useGameStore } from '@/stores/useGameStore';
import { RoomStatus } from '@prisma/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const GamePlay = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">{children}</div>
);

const GameEnded = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">{children}</div>
);

export function GameController() {
  const room = useGameStore((state: GameState) => state.room);
  const curPlayer = useCurPlayer();

  // State for modals
  const [showWinModal, setShowWinModal] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{
    name: string;
    cardId: string;
    winningRowIndex: number;
  } | null>(null);

  // Game log state
  const [gameLog, setGameLog] = useState<string[]>([]);

  // Add to game log
  const addToGameLog = (message: string) => {
    setGameLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleLeaveRoom = async () => {
    if (room && curPlayer) {
      try {
        await leaveRoomAction(room.id, curPlayer.id);
        // Redirect will happen automatically on successful leave
      } catch (error) {
        console.error('Failed to leave room:', error);
        useGameStore.getState().setGameError('Failed to leave room');
      }
    }
  };

  // Show confirmation dialog before resetting
  const showResetConfirmationDialog = () => {
    setShowResetConfirmation(true);
  };

  // Actual game reset handler
  const handlePlayAgain = async () => {
    console.log('hik');
    if (room && curPlayer?.isHost) {
      try {
        await updateRoomStatusAction(room.id, RoomStatus.waiting);
        // Close all modals
        setShowWinModal(false);
        setShowResetConfirmation(false);
        setWinnerInfo(null);
        // Reset game state
        setGameLog([]); // Clear game log for new game
        toast.success('Bắt đầu trò chơi mới!');
        addToGameLog('Trò chơi mới được bắt đầu');
      } catch (error) {
        console.error('Failed to restart game:', error);
        useGameStore.getState().setGameError('Failed to restart game');
        toast.error('Không thể bắt đầu trò chơi mới. Vui lòng thử lại.');
      }
    }
  };

  // Auto-call number for host
  const [isAutoCalling, setIsAutoCalling] = useState(false);
  const [autoCallInterval, setAutoCallInterval] = useState<NodeJS.Timeout | null>(null);

  const toggleAutoCall = () => {
    if (isAutoCalling) {
      // Stop auto-calling
      if (autoCallInterval) {
        clearInterval(autoCallInterval);
        setAutoCallInterval(null);
      }
      setIsAutoCalling(false);
      toast.info('Đã dừng gọi số tự động');
    } else {
      // Start auto-calling
      const interval = setInterval(async () => {
        if (room && curPlayer?.isHost) {
          try {
            const result = await callNumberAction(room.id);
            if (!result.success) {
              clearInterval(interval);
              setIsAutoCalling(false);
              setAutoCallInterval(null);
              toast.error(result.error || 'Không thể gọi số tự động');
            }
          } catch (error) {
            console.error('Auto-call error:', error);
            clearInterval(interval);
            setIsAutoCalling(false);
            setAutoCallInterval(null);
            toast.error('Đã có lỗi xảy ra khi gọi số tự động');
          }
        }
      }, 3000); // Call a number every 3 seconds

      setAutoCallInterval(interval);
      setIsAutoCalling(true);
      toast.success('Bắt đầu gọi số tự động');
    }
  };

  // Cleanup auto-call interval on component unmount
  useEffect(() => {
    return () => {
      if (autoCallInterval) {
        clearInterval(autoCallInterval);
      }
    };
  }, [autoCallInterval]);

  // Initial room data fetch
  useEffect(() => {
    if (!room || !curPlayer) {
      console.log('GameController component: No room or player found, cannot fetch initial data.');
      return;
    }

    console.log('GameController component: Fetching initial room data...');
    const fetchInitialRoomData = async () => {
      try {
        if (!room?.id) {
          console.error('GameController component: Cannot fetch data without room ID.');
          return;
        }

        const roomWithPlayers = await getRoomWithPlayersAction(room.id);

        // Guard Clause: Check for failure or missing room data first
        if (!roomWithPlayers.success || !roomWithPlayers.room) {
          console.error(
            'GameController component: Failed to fetch initial room data - API error or missing room:',
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

        // Add game status to log
        if (roomWithPlayers.room.status === RoomStatus.waiting) {
          addToGameLog('Chờ người chơi tham gia và chọn bảng');
        } else if (roomWithPlayers.room.status === RoomStatus.playing) {
          addToGameLog('Trò chơi đang diễn ra');
        } else if (roomWithPlayers.room.status === RoomStatus.ended) {
          addToGameLog('Trò chơi đã kết thúc');
        }
      } catch (error) {
        console.error('GameController component: Failed to fetch initial room data - Network/unexpected error:', error);
        useGameStore.getState().setGameError('An unexpected error occurred while loading room details.');
      }
    };

    fetchInitialRoomData();
  }, [room?.id, curPlayer?.id]);

  // Use the enhanced custom hook to manage realtime subscriptions with UI actions
  useRoomRealtime(room?.id, {
    // UI-specific actions
    addToGameLog,
    setShowWinModal,
    setWinnerInfo,
    setIsAutoCalling,
    setAutoCallInterval,
    autoCallInterval,
  });

  if (!room || !curPlayer) {
    return <div className="container mx-auto p-4">Loading room details...</div>;
  }

  const getCardById = (cardId: string) => {
    return cardTemplates.find((c) => c.id === cardId) || ([] as unknown as LoToCardType);
  };

  const isHost = curPlayer.isHost;
  const isWaiting = room.status === RoomStatus.waiting;
  const isPlaying = room.status === RoomStatus.playing;
  const isEnded = room.status === RoomStatus.ended || !!room.winnerId;

  return (
    <div className="container mx-auto px-3 py-4 sm:p-4">
      <div className="flex items-end justify-end mb-4 sm:mb-6">
        <Button variant="outline" onClick={handleLeaveRoom} className="text-sm sm:text-base">
          Thoát
        </Button>
      </div>

      <div className="flex flex-col gap-4 ">
        {/* Sidebar - Players and Game Log: at bottom on mobile, left side on desktop */}
        <div> Số phòng: {room.code}</div>
        <div className="space-y-4 ">
          <PlayerList />

          {/* Game Log */}
          {/* <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-bold mb-2">
              Nhật ký trò chơi
            </h2>
            <div className="max-h-32 sm:max-h-40 overflow-y-auto text-xs sm:text-sm space-y-1">
              {gameLog.length > 0 ? (
                gameLog.map((log, index) => (
                  <p key={index} className="text-gray-700">
                    {log}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">Chưa có sự kiện nào</p>
              )}
            </div>
          </div> */}
        </div>

        <div className="">
          {/* Waiting State UI */}
          {isWaiting && (
            <div>
              {!isHost && (
                <div className="">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Chờ chủ xị</h2>
                  <p className="text-sm sm:text-base">Chủ xị sẽ bắt đầu trò chơi khi tất cả mọi người đã chọn bảng.</p>
                </div>
              )}
              <div className="mt-3 sm:mt-4">
                <CardSelection />
              </div>
            </div>
          )}

          {/* Playing State UI */}
          {isPlaying && (
            <GamePlay>
              {/* Sticky NumberCaller at the top, always visible */}
              <div className="sticky top-0 z-20 bg-background pb-2">
                <NumberDisplay />
              </div>
              {curPlayer.selectedCardIds.length > 0 ? (
                <div className="w-full flex flex-col items-center justify-center">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Bảng của bạn</h2>
                  {/* Responsive container for 1 or 2 cards */}
                  <div className={'flex flex-row gap-4 w-full justify-center items-center max-h-[60vh]'}>
                    {curPlayer.selectedCardIds.map((cardId) => (
                      <LoToCard
                        key={cardId}
                        card={getCardById(cardId)}
                        playable={true}
                        className="w-full max-w-[400px] md:max-w-[350px] max-h-[55vh]"
                        style={{ flex: 1, minWidth: 0 }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 sm:p-8">
                  <p className="text-red-500 text-base sm:text-lg">Bạn chưa chọn bảng!</p>
                  <p className="mt-2 text-sm sm:text-base">Không thể tham gia trò chơi nếu chưa chọn bảng.</p>
                </div>
              )}
              {/* Host-only controls, below cards */}
              {!room.winnerId && isHost && (
                <div className="mt-3 sm:mt-4 flex justify-center">
                  <NumberCallerControls />
                </div>
              )}
            </GamePlay>
          )}

          {/* Game Ended State UI */}
          {isEnded && (
            <GameEnded>
              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold mb-2">Trò chơi kết thúc!</h2>
                <p className="text-sm sm:text-base">Người chiến thắng đã được xác định</p>
              </div>
              {curPlayer?.isHost && (
                <div className="flex justify-center">
                  <Button
                    onClick={showResetConfirmationDialog}
                    className="px-6 sm:px-8 h-12 sm:h-10 text-sm sm:text-base w-full sm:w-auto"
                  >
                    Chơi lại
                  </Button>
                </div>
              )}
            </GameEnded>
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
          onPlayAgain={isHost ? showResetConfirmationDialog : undefined}
        />
      )}

      {/* Reset Game Confirmation Dialog */}
      <Dialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận bắt đầu lại</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn bắt đầu trò chơi mới?</p>
            <p className="mt-2 text-sm text-gray-500">
              Tất cả số đã gọi và đánh dấu sẽ bị xóa, nhưng người chơi sẽ vẫn ở trong phòng.
            </p>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowResetConfirmation(false)}>
              Hủy
            </Button>
            <Button onClick={handlePlayAgain}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
