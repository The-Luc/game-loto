'use client';

import { useGameStore, GameState } from '@/stores/useGameStore';
import { Button } from '@/components/ui/button';
import { Player } from '@prisma/client';
import { useCurPlayer } from '../hooks/useCurPlayer';

export function PlayerList() {
  const playersInRoom = useGameStore((state: GameState) => state.playersInRoom);
  const currentPlayer = useCurPlayer();

  if (!currentPlayer) return null;

  const isHost = currentPlayer.isHost;

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4" aria-label="Danh sách người chơi" role="region">
      <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4" id="player-list-heading">
        Danh sách người chơi ({playersInRoom.length})
      </h2>
      <ul className="space-y-1 sm:space-y-2" aria-labelledby="player-list-heading">
        {playersInRoom.map((p: Player) => (
          <li
            key={p.id}
            className="flex flex-wrap sm:flex-nowrap items-center justify-between p-1.5 sm:p-2 border-b text-sm sm:text-base"
            aria-label={`Người chơi: ${p.nickname}${p.isHost ? ', Chủ xị' : ''}${p.id === currentPlayer.id ? ', Bạn' : ''}${p.selectedCardIds.length > 0 ? ', Đã sẵn sàng' : ', Chưa sẵn sàng'}`}
          >
            <div className="flex items-center flex-grow min-w-0">
              <span className="font-medium truncate">{p.nickname}</span>
              <div className="flex flex-wrap gap-1 ml-1.5">
                {p.isHost && (
                  <span
                    className="text-xxs sm:text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded inline-flex items-center"
                    aria-label="Chủ xị"
                  >
                    Chủ xị
                  </span>
                )}
                {p.id === currentPlayer.id && (
                  <span
                    className="text-xxs sm:text-xs bg-green-100 text-green-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded inline-flex items-center"
                    aria-label="Bạn"
                  >
                    Bạn
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-auto mt-1 sm:mt-0">
              {p.selectedCardIds.length > 0 ? (
                <div
                  className="text-xxs sm:text-xs font-medium text-green-600 flex items-center gap-1"
                  aria-label="Đã sẵn sàng"
                >
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></span>
                  <span className="hidden xs:inline">Sẵn sàng</span>
                </div>
              ) : (
                <div
                  className="text-xxs sm:text-xs font-medium text-gray-500 flex items-center gap-1"
                  aria-label="Chưa sẵn sàng"
                >
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gray-400"></span>
                  <span className="hidden xs:inline">Đang chọn...</span>
                </div>
              )}
              {/* {false && isHost && p.id !== currentPlayer?.id && (
                <Button
                  variant="destructive"
                  size="sm" 
                  className="text-xxs sm:text-xs h-6 sm:h-8"
                  aria-label={`Loại người chơi ${p.nickname}`}
                >
                  Tui không biết người này
                </Button>
              )} */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
