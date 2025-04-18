'use server';

import { prisma } from '@/lib/prisma';
import { cardTemplates } from '@/lib/card-template';
import { supabaseRealtime } from '@/lib/supabase';
import { RealtimeEventEnum } from '@/lib/enums';
import { RoomStatus } from '@prisma/client';

type SelectCardResponse = {
	success: boolean;
	error?: string;
	cardId?: string;
};

/**
 * Select a card for a player
 */
export async function selectCardAction(playerId: string, cardId: string): Promise<SelectCardResponse> {
	try {
		// Validate card ID
		const validCard = cardTemplates.find(card => card.id === cardId);
		if (!validCard) {
			return {
				success: false,
				error: 'Invalid card selection.'
			};
		}

		// Find the player
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			include: { room: { include: { players: true } } }
		});

		if (!player) {
			return {
				success: false,
				error: 'Không tìm thấy người chơi'
			};
		}

		// Check if the room is in the correct state
		if (player.room.status !== RoomStatus.waiting) {
			return {
				success: false,
				error: 'Không thể chọn thẻ. Phòng đã bắt đầu.'
			};
		}

		// Check if this card is already selected by another player
		const cardAlreadySelected = player.room.players.some(
			p => p.id !== playerId && p.cardId === cardId
		);

		if (cardAlreadySelected) {
			return {
				success: false,
				error: 'Người chơi khác đã chọn thẻ này'
			};
		}

		// Update the player with the selected card
		await prisma.player.update({
			where: { id: playerId },
			data: { cardId }
		});

		// Broadcast card selection event for real-time updates
		// Ensure payload matches CardSelectedPayload: only playerId and cardId
		await supabaseRealtime.broadcast(player.room.id, RealtimeEventEnum.CARD_SELECTED, {
			playerId,
			cardId,
		});

		return {
			success: true,
			cardId
		};
	} catch (error) {
		console.error('Failed to select card:', error);
		return {
			success: false,
			error: 'Failed to select card. Please try again.'
		};
	}
}

/**
 * Mark a number on player's card
 */
export async function markNumberAction(playerId: string, number: number) {
	try {
		// Find the player
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			include: { room: true }
		});

		if (!player) {
			return { success: false, error: 'Player not found.' };
		}

		// Check if the room is in the playing state
		if (player.room.status !== 'playing') {
			return { success: false, error: 'Trò chơi chưa bắt đầu.' };
		}

		// Check if the number has been called in the room
		if (!player.room.calledNumbers.includes(number)) {
			return { success: false, error: 'This number has not been called yet.' };
		}

		// Check if the player already marked this number
		if (player.markedNumbers.includes(number)) {
			return { success: true, alreadyMarked: true };
		}

		// Update the player's marked numbers
		const updatedPlayer = await prisma.player.update({
			where: { id: playerId },
			data: {
				markedNumbers: [...player.markedNumbers, number],
			},
		});

		// Broadcast card update event for real-time updates
		await supabaseRealtime.broadcast(player.room.id, RealtimeEventEnum.CARD_UPDATED, {
			playerId,
			markedNumbers: updatedPlayer.markedNumbers,
			markedNumber: number
		});

		return {
			success: true,
			markedNumbers: updatedPlayer.markedNumbers,
		};
	} catch (error) {
		console.error('Failed to mark number:', error);
		return {
			success: false,
			error: 'Failed to mark number. Please try again.'
		};
	}
}
