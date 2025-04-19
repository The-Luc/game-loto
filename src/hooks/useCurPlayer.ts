import { useGameStore } from '@/stores/useGameStore';
import { Player } from '@prisma/client';

/**
 * Custom hook to get the current player from the game store
 * @returns The current player or undefined if no current player exists
 */
export const useCurPlayer = (): Player | undefined => 
  useGameStore(state => 
    state.curPlayerId
      ? state.playersInRoom.find(p => p.id === state.curPlayerId)
      : undefined
  );
