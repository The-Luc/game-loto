import { Player, Room } from '@prisma/client';


export interface LoToCard {
  id: string;
  grid: (number | null)[][];
}

export interface GameState {
  room?: Room;
  player?: Player;
  otherPlayers?: Player[];
}

export type ErrorResponse = {
  success: boolean;
  error?: string;
};