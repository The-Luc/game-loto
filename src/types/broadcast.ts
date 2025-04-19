import { RealtimeEventEnum } from '@/lib/enums';
import { Player } from '@prisma/client';

/**
 * Standardized information about a player included in broadcast payloads.
 */
export type BroadcastPlayerInfo = {
	id: string;
	nickname: string;
	isHost: boolean;
	cardId: string | null; // Card might not be selected yet
	// Add other relevant player details if needed in broadcasts
};

/**
 * Payload for the PLAYER_JOINED event.
 */
export type PlayerJoinedPayload = {
	player: Pick<Player, 'id' | 'nickname' | 'isHost' | 'selectedCardIds'>; // Using Pick for clarity, updated cardId to selectedCardIds
};

/**
 * Payload for the PLAYER_LEFT event.
 */
export type PlayerLeftPayload = {
	playerId: string; // Just need the ID to identify who left
};

/**
 * Payload when the game starts.
 */
export type GameStartedPayload = {
	startTime: string; // ISO string format
};

/**
 * Payload for the CARD_SELECTED event.
 */
export type CardSelectedPayload = {
	playerId: string;
	selectedCardIds: string[]; // Changed from cardId: string
};

/**
 * Payload for the NUMBER_CALLED event.
 */
export type NumberCalledPayload = {
	number: number;
	calledNumbers: number[]; // The full list after calling the new number
};

/**
 * Payload when the game ends.
 */
export type GameEndedPayload = {
	winner?: Pick<Player, 'id' | 'nickname'>;
	endTime: string; // ISO string format
};

/**
 * Payload when a player marks a number on their card.
 */
export type CardUpdatedPayload = {
	playerId: string;
	markedNumbers: number[];
	markedNumber: number; // The specific number just marked
};

/**
 * Payload when a player wins the game.
 */
export type WinnerDeclaredPayload = {
	playerId: string;
	winnerName: string;
	winningNumbers: number[];
	cardId: string;
	winningRowIndex: number;
};

/**
 * A mapping between RealtimeEventEnum values and their corresponding payload types.
 * This is crucial for the generic subscribe/broadcast functions.
 */
export type BroadcastPayloadMap = {
	[RealtimeEventEnum.PLAYER_JOINED]: PlayerJoinedPayload;
	[RealtimeEventEnum.PLAYER_LEFT]: PlayerLeftPayload;
	[RealtimeEventEnum.GAME_STARTED]: GameStartedPayload;
	[RealtimeEventEnum.CARD_SELECTED]: CardSelectedPayload;
	[RealtimeEventEnum.NUMBER_CALLED]: NumberCalledPayload;
	[RealtimeEventEnum.GAME_ENDED]: GameEndedPayload;
	[RealtimeEventEnum.CARD_UPDATED]: CardUpdatedPayload;
	[RealtimeEventEnum.WINNER_DECLARED]: WinnerDeclaredPayload;
	// Add mappings for any other custom events
};

/**
 * Generic type for the full payload received by the broadcast mechanism,
 * including the standard 'roomId' and the event-specific payload.
 */
// Revert to the simpler definition, relying on assertions in consuming functions
// export type FullBroadcastPayload<E extends keyof RealtimeEventEnum> = {
// 	roomId: string;
// } & BroadcastPayloadMap[E];
