import { Player, Room as PrismaRoom } from '@prisma/client';

// Extend the Room type to include players
export interface Room extends PrismaRoom {
  players?: Player[];
}

export interface LoToCard {
  id: string;
  backgroundColor?: string;
  grid: (number | null)[][];
}

export interface GameState {
  room?: Room;
  player?: Player;
  readyPlayerIds?: string[];
}

export type ErrorResponse = {
  success: boolean;
  error?: string;
};

// Type definitions for our real-time channels and events
export type RealtimeEvent = 'number-called' | 'player-joined' | 'player-left' | 'game-started' | 'game-ended' | 'card-selected' | 'card-updated' | 'winner-declared';
