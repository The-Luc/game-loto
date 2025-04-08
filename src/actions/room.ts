'use server';

import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/game-utils';
import { getRandomCardTemplate } from '@/lib/card-template';
import { Player, Room, RoomStatus } from '@prisma/client';
import { handleApiResponse } from '../lib/utils';

type CreateRoomResponse = {
	success: boolean;
	room?: Room
	error?: string;
	player?: Player
};

type JoinRoomResponse = {
	success: boolean;
	error?: string;
	room?: Room;
	player?: Player;
};

/**
 * Create a new room and host player
 */
export async function createRoomAction(nickname: string): Promise<CreateRoomResponse> {
	try {
		// Generate a unique room code
		const roomCode = generateRoomCode();

		// Check if room code already exists (unlikely but possible)
		const existingRoom = await prisma.room.findUnique({
			where: { code: roomCode },
		});

		if (existingRoom) {
			return {
				success: false,
				error: 'Room code already exists. Please try again.'
			};
		}

		// Create a new room
		const room = await prisma.room.create({
			data: {
				code: roomCode,
				hostId: '', // Will update this after creating the player
				status: 'waiting' as RoomStatus,
				calledNumbers: [],
			}
		});

		// Generate a card for the player
		const card = getRandomCardTemplate();

		// Create the host player
		const player = await prisma.player.create({
			data: {
				nickname,
				isHost: true,
				cardId: card.id,
				markedNumbers: [],
				roomId: room.id,
			}
		});

		// Update the room with the host ID
		await prisma.room.update({
			where: { id: room.id },
			data: { hostId: player.id }
		});

		return {
			success: true,
			room,
			player,
		};
	} catch (error) {
		console.error('Failed to create room:', error);
		return {
			success: false,
			error: 'Failed to create room. Please try again.'
		};
	}
}

/**
 * Join an existing room
 */
export async function joinRoomAction(roomCode: string, nickname: string): Promise<JoinRoomResponse> {
	try {
		// Find the room by code
		const room = await prisma.room.findUnique({
			where: { code: roomCode },
			include: { players: true }
		});
		console.log("🚀 ~ joinRoomAction ~ room:", room)
		console.log("🚀 ~ joinRoomAction ~ nickname:", nickname)

		if (!room) {
			const response = {
				success: false,
				error: 'Room not found. Please check the room code.'
			};
			handleApiResponse(response);
			return response;
		}

		// Check if room is in a joinable state
		if (room.status !== RoomStatus.waiting) {
			const response = {
				success: false,
				error: 'Cannot join room. Game has already started.'
			};
			handleApiResponse(response);
			return response;
		}

		// Generate a card for the player
		const card = getRandomCardTemplate();

		// Create a new player in the room
		const player = await prisma.player.create({
			data: {
				nickname,
				isHost: false,
				cardId: card.id,
				markedNumbers: [],
				roomId: room.id,
			}
		});

		return {
			success: true,
			room,
			player
		};
	} catch (error) {
		console.error('Failed to join room:', error);
		return {
			success: false,
			error: 'Failed to join room. Please try again.'
		};
	}
}

/**
 * Get room details with players
 */
export async function getRoomWithPlayersAction(roomId: string) {
	try {
		const room = await prisma.room.findUnique({
			where: { id: roomId },
			include: { players: true }
		});

		return { success: true, room };
	} catch (error) {
		console.error('Failed to get room details:', error);
		return { success: false, error: 'Failed to get room details' };
	}
}

/**
 * Update room status
 */
export async function updateRoomStatusAction(roomId: string, status: RoomStatus) {
	try {
		await prisma.room.update({
			where: { id: roomId },
			data: { status }
		});

		return { success: true };
	} catch (error) {
		console.error('Failed to update room status:', error);
		return { success: false, error: 'Failed to update room status' };
	}
}

export async function leaveRoomAction(roomId: string, playerId: string) {
	try {
		// Remove player from the room
		await prisma.player.delete({
			where: { id: playerId }
		});

		// If no players left, delete the room
		const room = await prisma.room.findUnique({ where: { id: roomId }, include: { players: true } });
		if (!room) return { success: true };

		if (room.players.length === 0) {
			await prisma.room.delete({ where: { id: roomId } });
		}

		return { success: true };
	} catch (error) {
		console.error('Failed to leave room:', error);
		return { success: false, error: 'Failed to leave room' };
	}
}