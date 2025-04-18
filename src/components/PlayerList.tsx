'use client';

import { useGameStore, GameState } from '@/stores/useGameStore';
import { Button } from '@/components/ui/button';
import { Player } from '@prisma/client';

export function PlayerList() {
  const playersInRoom = useGameStore((state: GameState) => state.playersInRoom);
  const currentPlayer = useGameStore((state: GameState) => state.player);

  if (!currentPlayer) return null;

  const isHost = currentPlayer.isHost;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">
        Danh sách người chơi ({playersInRoom.length})
      </h2>
      <ul className="space-y-2">
        {playersInRoom.map((p: Player) => (
          <li
            key={p.id}
            className="flex items-center justify-between p-2 border-b"
          >
            <div className="flex items-center">
              <span className="font-medium">{p.nickname}</span>
              {p.isHost && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Chủ xị
                </span>
              )}
              {p.id === currentPlayer.id && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Bạn
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {p.selectedCardIds.length > 0 ? (
                <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Sẵn sàng
                </div>
              ) : (
                <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  Đang chọn...
                </div>
              )}
              {false && isHost && p.id !== currentPlayer?.id && (
                <Button
                  variant="destructive"
                  size="sm" /* onClick={() => kickPlayer(p.id)} */
                >
                  Tui không biết người này
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
