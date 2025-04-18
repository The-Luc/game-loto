import { create } from 'zustand';
import { Player, Room } from '@prisma/client';
import { LoToCard } from '@/lib/types'; // Assuming LoToCard might be needed

// Export the interface
export interface GameState {
  room: Room | null;
  player: Player | null;
  playersInRoom: Player[]; // Keep track of all players in the room
  selectedCard: LoToCard | null;
  calledNumbers: number[];
  winner: Player | null;
  gameError: string | null;

  setRoom: (room: Room | null) => void;
  setPlayer: (player: Player | null) => void;
  setPlayersInRoom: (players: Player[]) => void;
  addPlayerToRoom: (player: Player) => void;
  removePlayerFromRoom: (playerId: string) => void;
  setSelectedCard: (card: LoToCard | null) => void;
  setCalledNumbers: (numbers: number[]) => void;
  addCalledNumber: (number: number) => void;
  setWinner: (player: Player | null) => void;
  setGameError: (error: string | null) => void;
  resetGame: () => void; // Action to reset state for a new game or on leave
}

// Explicitly type the initial state object for clarity
const initialState: Omit<GameState, 'setRoom' | 'setPlayer' | 'setPlayersInRoom' | 'addPlayerToRoom' | 'removePlayerFromRoom' | 'setSelectedCard' | 'setCalledNumbers' | 'addCalledNumber' | 'setWinner' | 'setGameError' | 'resetGame'> = {
  room: null,
  player: null,
  playersInRoom: [],
  selectedCard: null,
  calledNumbers: [],
  winner: null,
  gameError: null,
};

// Remove explicit type for 'set' - let Zustand infer it
export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  // Add types to action parameters
  setRoom: (room: Room | null) => set({ room }),
  setPlayer: (player: Player | null) => set({ player }),
  setPlayersInRoom: (players: Player[]) => set({ playersInRoom: players }),
  addPlayerToRoom: (player: Player) => set((state: GameState) => ({
    // Type 'p' in filter
    playersInRoom: [...state.playersInRoom.filter((p: Player) => p.id !== player.id), player]
  })),
  removePlayerFromRoom: (playerId: string) => set((state: GameState) => ({
    // Type 'p' in filter
    playersInRoom: state.playersInRoom.filter((p: Player) => p.id !== playerId),
  })),
  setSelectedCard: (card: LoToCard | null) => set({ selectedCard: card }),
  setCalledNumbers: (numbers: number[]) => set({ calledNumbers: numbers }),
  addCalledNumber: (number: number) => set((state: GameState) => ({
    calledNumbers: [...state.calledNumbers, number],
  })),
  setWinner: (winner: Player | null) => set({ winner }),
  setGameError: (error: string | null) => set({ gameError: error }),
  resetGame: () => set(initialState), // Reset to initial values
}));
