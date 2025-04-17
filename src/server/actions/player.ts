'use server';

import { prisma } from '@/lib/prisma';
import { handleApiResponse } from '@/lib/utils';
import { cardTemplates } from '@/lib/card-template';

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
			const response = {
				success: false,
				error: 'Invalid card selection.'
			};
			handleApiResponse(response);
			return response;
		}

		// Find the player
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			include: { room: { include: { players: true } } }
		});

		if (!player) {
			const response = {
				success: false,
				error: 'Player not found.'
			};
			handleApiResponse(response);
			return response;
		}

		// Check if the room is in the correct state
		if (player.room.status !== 'selecting' && player.room.status !== 'waiting') {
			const response = {
				success: false,
				error: 'Cannot select card. Game has already started.'
			};
			handleApiResponse(response);
			return response;
		}

		// Check if this card is already selected by another player
		const cardAlreadySelected = player.room.players.some(
			p => p.id !== playerId && p.cardId === cardId
		);

		if (cardAlreadySelected) {
			const response = {
				success: false,
				error: 'This card has already been selected by another player.'
			};
			handleApiResponse(response);
			return response;
		}

		// Update the player with the selected card
		await prisma.player.update({
			where: { id: playerId },
			data: { cardId }
		});

		// If all players have selected cards and room is in waiting state,
		// update room status to 'selecting'
		if (player.room.status === 'waiting') {
			const allPlayersHaveCards = player.room.players.every(p => 
				p.id === playerId || p.cardId !== '');

			if (allPlayersHaveCards) {
				await prisma.room.update({
					where: { id: player.room.id },
					data: { status: 'selecting' }
				});
			}
		}

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
			return { success: false, error: 'Game is not in playing state.' };
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
