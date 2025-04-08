'use client';

import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';

export function PlayerList() {
  const { gameState, kickPlayer } = useGame();
  const { room, player, otherPlayers } = gameState;
  console.log('🚀 ~ PlayerList ~ room:', room);

  if (!room || !player) return null;

  const isHost = player.isHost;
  const allPlayers = [player, ...(otherPlayers || [])];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <ul className="space-y-2">
        {allPlayers.map(p => (
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

            {isHost && p.id !== player.id && (
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
