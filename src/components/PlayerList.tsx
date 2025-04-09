'use client';

import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Badge } from './ui/badge';

export function PlayerList() {
  const { gameState, kickPlayer } = useGame();
  const { room, player } = gameState;

  if (!room || !player) return null;

  const isHost = player.isHost;
  const readyPlayerIds = gameState.readyPlayerIds || [];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <ul className="space-y-2">
        {room?.players?.map(p => (
          <li key={p.id} className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
              <span className="font-medium">{p.nickname}</span>
              {p.isHost && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Host
                </span>
              )}
              {p.id === player.id && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  You
                </span>
              )}
            </div>
            {readyPlayerIds.includes(p.id) && (
              <Badge variant="outline" className="ml-2">
                Ready
              </Badge>
            )}

            {false && isHost && p.id !== player?.id && (
              <Button variant="destructive" size="sm" onClick={() => kickPlayer(p.id)}>
                Kick
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
