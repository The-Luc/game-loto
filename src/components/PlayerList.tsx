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
      <h2 className="text-xl font-bold mb-4">Players ({playersInRoom.length})</h2>
      <ul className="space-y-2">
        {playersInRoom.map((p: Player) => (
          <li key={p.id} className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
              <span className="font-medium">{p.nickname}</span>
              {p.isHost && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Host
                </span>
              )}
              {p.id === currentPlayer.id && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  You
                </span>
              )}
            </div>

            {false && isHost && p.id !== currentPlayer?.id && (
              <Button variant="destructive" size="sm" /* onClick={() => kickPlayer(p.id)} */ >
                Kick
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
