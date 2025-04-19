import { useGameStore } from '@/stores/useGameStore';
import { Player } from '@prisma/client';

/**
 * Utility function to get the current player outside of React components
 * For example, in event handlers or non-component code
 * @returns The current player or undefined if no current player exists
 */
export const getCurPlayer = (): Player | undefined => {
  const state = useGameStore.getState();
  return state.curPlayerId
    ? state.playersInRoom.find(p => p.id === state.curPlayerId)
    : undefined;
};
