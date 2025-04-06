export interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  selectedCard?: LoToCard;
  markedNumbers?: number[];
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'selecting' | 'playing' | 'ended';
  calledNumbers?: number[];
  currentNumber?: number;
  createdAt: string;
}

export interface LoToCard {
  id: string;
  grid: (number | null)[][];
}

export interface GameState {
  room?: Room;
  player?: Player;
  availableCards?: LoToCard[];
}
