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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RoomStatus } from '@prisma/client';
import {
  leaveRoomAction,
  updateRoomStatusAction,
  getRoomWithPlayersAction,
  callNumberAction,
} from '@/server/actions/room';
import { useRoomRealtime } from '@/lib/supabase-subscribe';
import { subscribe } from '@/lib/supabase';
import { RealtimeEventEnum } from '@/lib/enums';
import { cardTemplates } from '@/lib/card-template';
import { LoToCardType } from '@/lib/types';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Game view components
const WaitingRoom = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">{children}</div>
);

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

  const handleStartGame = async () => {
    if (room && curPlayer?.isHost) {
      try {
        // Check if all players have selected cards
        const allPlayersHaveCards = useGameStore.getState().playersInRoom.every((p) => p.selectedCardIds.length > 0);
        
        if (!allPlayersHaveCards) {
          toast.warning('Không thể bắt đầu! Một số người chơi chưa chọn bảng.');
          return;
        }
        
        await updateRoomStatusAction(room.id, RoomStatus.playing);
        addToGameLog('Trò chơi bắt đầu');
        toast.success('Trò chơi đã bắt đầu!');
      } catch (error) {
        console.error('Failed to start game:', error);
        useGameStore.getState().setGameError('Failed to start game');
        toast.error('Không thể bắt đầu trò chơi. Vui lòng thử lại.');
      }
    }
  };

  // Show confirmation dialog before resetting
  const showResetConfirmationDialog = () => {
    setShowResetConfirmation(true);
  };
  
  // Actual game reset handler
  const handlePlayAgain = async () => {
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
      console.log(
        'GameController component: No room or player found, cannot fetch initial data.'
      );
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
        console.error(
          'GameController component: Failed to fetch initial room data - Network/unexpected error:',
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
  }, [room?.id, curPlayer?.id]);

  // Use the custom hook to manage realtime subscriptions
  useRoomRealtime(room?.id);

  // Subscribe to game events
  useEffect(() => {
    if (!room?.id) return;
    
    // Subscribe to winner declared events
    const unsubscribeWinner = subscribe(
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
        addToGameLog(`${payload.winnerName} đã chiến thắng!`);
        
        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    );
    
    // Subscribe to number called events
    const unsubscribeNumberCalled = subscribe(
      room.id,
      RealtimeEventEnum.NUMBER_CALLED,
      (payload) => {
        console.log('Number called event received:', payload);
        addToGameLog(`Số ${payload.number} đã được gọi`);
      }
    );
    
    // Subscribe to player joined events
    const unsubscribePlayerJoined = subscribe(
      room.id,
      RealtimeEventEnum.PLAYER_JOINED,
      (payload) => {
        console.log('Player joined event received:', payload);
        addToGameLog(`${payload.player.nickname} đã tham gia phòng`);
        toast.info(`${payload.player.nickname} đã tham gia phòng!`);
      }
    );
    
    // Subscribe to player left events
    const unsubscribePlayerLeft = subscribe(
      room.id,
      RealtimeEventEnum.PLAYER_LEFT,
      (payload) => {
        console.log('Player left event received:', payload);
        addToGameLog(`${payload.playerNickname} đã rời phòng`);
        toast.info(`${payload.playerNickname} đã rời phòng`);
      }
    );
    
    // Subscribe to game started events
    const unsubscribeGameStarted = subscribe(
      room.id,
      RealtimeEventEnum.GAME_STARTED,
      () => {
        console.log('Game started event received');
        addToGameLog('Trò chơi đã bắt đầu');
        toast.success('Trò chơi đã bắt đầu!');
      }
    );
    
    // Subscribe to game ended events
    const unsubscribeGameEnded = subscribe(
      room.id,
      RealtimeEventEnum.GAME_ENDED,
      () => {
        console.log('Game ended event received');
        addToGameLog('Trò chơi đã kết thúc');
        
        // Stop auto-calling if it's active
        if (isAutoCalling && autoCallInterval) {
          clearInterval(autoCallInterval);
          setAutoCallInterval(null);
          setIsAutoCalling(false);
        }
      }
    );
    
    return () => {
      unsubscribeWinner();
      unsubscribeNumberCalled();
      unsubscribePlayerJoined();
      unsubscribePlayerLeft();
      unsubscribeGameStarted();
      unsubscribeGameEnded();
    };
  }, [room?.id, isAutoCalling, autoCallInterval]);

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
  const isEnded = room.status === RoomStatus.ended || !!room.winnerId;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mã phòng: {room.code}</h1>
        <Button variant="outline" onClick={handleLeaveRoom}>
          Thoát
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Players and Game Log */}
        <div className="space-y-4">
          <PlayerList />
          
          {/* Game Log */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-2">Nhật ký trò chơi</h2>
            <div className="max-h-40 overflow-y-auto text-sm space-y-1">
              {gameLog.length > 0 ? (
                gameLog.map((log, index) => (
                  <p key={index} className="text-gray-700">{log}</p>
                ))
              ) : (
                <p className="text-gray-500 italic">Chưa có sự kiện nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Game Content */}
        <div className="md:col-span-2">
          {/* Waiting State UI */}
          {isWaiting && (
            <WaitingRoom>
              {isHost ? (
                <div>
                  <p className="mb-4">
                    Chia sẻ mã phòng với bạn bè:{' '}
                    <span className="font-bold">{room.code}</span>
                  </p>
                  <Button 
                    onClick={handleStartGame}
                    disabled={useGameStore.getState().playersInRoom.some(p => p.selectedCardIds.length === 0)}
                  >
                    Bắt đầu trò chơi
                  </Button>
                  {useGameStore.getState().playersInRoom.some(p => p.selectedCardIds.length === 0) && (
                    <p className="text-amber-600 mt-2 text-sm">Một số người chơi chưa chọn bảng</p>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4">Chờ chủ xị</h2>
                  <p>
                    Chủ xị sẽ bắt đầu trò chơi khi tất cả mọi người đã chọn bảng.
                  </p>
                </div>
              )}
              <div className="mt-4">
                <CardSelection />
              </div>
            </WaitingRoom>
          )}

          {/* Playing State UI */}
          {isPlaying && (
            <GamePlay>
              {curPlayer.selectedCardIds.length > 0 ? (
                <div>
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
              ) : (
                <div className="text-center p-8">
                  <p className="text-red-500 text-lg">Bạn chưa chọn bảng!</p>
                  <p className="mt-2">Không thể tham gia trò chơi nếu chưa chọn bảng.</p>
                </div>
              )}

              {/* Number Caller Section */}
              {!room.winnerId && (
                <div className="mt-6">
                  <NumberCaller />
                  
                  {/* Auto-call toggle for host */}
                  {isHost && (
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={toggleAutoCall}
                        variant={isAutoCalling ? "destructive" : "outline"}
                      >
                        {isAutoCalling ? "Dừng gọi số tự động" : "Bắt đầu gọi số tự động"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </GamePlay>
          )}

          {/* Game Ended State UI */}
          {isEnded && (
            <GameEnded>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-2">Trò chơi kết thúc!</h2>
                <p>Người chiến thắng đã được xác định</p>
              </div>
              {curPlayer?.isHost && (
                <div className="flex justify-center">
                  <Button onClick={showResetConfirmationDialog} className="px-8">
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
            <Button onClick={handlePlayAgain}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
