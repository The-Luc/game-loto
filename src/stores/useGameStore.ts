import { create } from 'zustand';
import { Player, Room } from '@prisma/client';
import { LoToCardType } from '@/lib/types'; // Assuming LoToCard might be needed

// Export the interface
export interface GameState {
  // State
  room: Room | null;
  playersInRoom: Player[]; // Keep track of all players in the room
  curPlayerId: string | null; // ID of the current player
  selectedCard: LoToCardType | null;
  calledNumbers: number[];
  winner: Player | null;
  gameError: string | null;

  // Setters/Actions
  setRoom: (room: Room | null) => void;
  setPlayersInRoom: (players: Player[]) => void;
  setCurPlayerId: (playerId: string | null) => void;
  setCurPlayer: (playerUpdate: Partial<Player>) => void; // Update current player in array
  addPlayerToRoom: (player: Player) => void;
  removePlayerFromRoom: (playerId: string) => void;
  setSelectedCard: (card: LoToCardType | null) => void;
  setCalledNumbers: (numbers: number[]) => void;
  addCalledNumber: (number: number) => void;
  setWinner: (player: Player | null) => void;
  setGameError: (error: string | null) => void;
  resetGame: () => void; // Action to reset state for a new game or on leave
}

// Explicitly type the initial state object for clarity
const initialState: Omit<
  GameState,
  | 'setRoom'
  | 'setPlayersInRoom'
  | 'setCurPlayerId'
  | 'setCurPlayer'
  | 'addPlayerToRoom'
  | 'removePlayerFromRoom'
  | 'setSelectedCard'
  | 'setCalledNumbers'
  | 'addCalledNumber'
  | 'setWinner'
  | 'setGameError'
  | 'resetGame'
> = {
  room: null,
  selectedCard: null,
  playersInRoom: [],
  curPlayerId: null,
  calledNumbers: [],
  winner: null,
  gameError: null,
};

// Remove explicit type for 'set' - let Zustand infer it
export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  // Add types to action parameters
  setRoom: (room: Room | null) => set({ room }),
  setPlayersInRoom: (players: Player[]) => set({ playersInRoom: players }),
  setCurPlayerId: (playerId: string | null) => set({ curPlayerId: playerId }),

  // Update current player in the players array
  setCurPlayer: (playerUpdate: Partial<Player>) =>
    set((state: GameState) => {
      if (!state.curPlayerId) return state; // No current player to update

      const playerIndex = state.playersInRoom.findIndex(
        (p) => p.id === state.curPlayerId
      );
      if (playerIndex === -1) return state; // Player not found

      // Create updated players array with the modified player
      const updatedPlayers = [...state.playersInRoom];
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        ...playerUpdate,
      };

      return { playersInRoom: updatedPlayers };
    }),

  addPlayerToRoom: (player: Player) =>
    set((state: GameState) => ({
      playersInRoom: [
        ...state.playersInRoom.filter((p: Player) => p.id !== player.id),
        player,
      ],
    })),
  removePlayerFromRoom: (playerId: string) =>
    set((state: GameState) => ({
      // Type 'p' in filter
      playersInRoom: state.playersInRoom.filter(
        (p: Player) => p.id !== playerId
      ),
    })),
  setSelectedCard: (card: LoToCardType | null) => set({ selectedCard: card }),
  setCalledNumbers: (numbers: number[]) => set({ calledNumbers: numbers }),
  addCalledNumber: (number: number) =>
    set((state: GameState) => ({
      calledNumbers: [...state.calledNumbers, number],
    })),
  setWinner: (winner: Player | null) => set({ winner }),
  setGameError: (error: string | null) => set({ gameError: error }),
  resetGame: () => set(initialState), // Reset to initial values
}));

// Selectors and utility functions moved to dedicated files:
// - useCurPlayer: src/hooks/useCurPlayer.ts
// - getCurPlayer: src/utils/playerUtils.ts
