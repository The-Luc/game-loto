'use server';

import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/game-utils';
import { Player, RoomStatus } from '@prisma/client';
import { handleApiResponse } from '@/lib/utils';
import { Room } from '@/lib/types';
import { supabaseRealtime } from '@/lib/supabase';
import { RealtimeEventEnum } from '@/lib/enums';

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

		// Create the host player
		const player = await prisma.player.create({
			data: {
				nickname,
				isHost: true,
				cardId: '',
				markedNumbers: [],
				roomId: room.id,
			}
		});

		// Update the room with the host ID
		await prisma.room.update({
			where: { id: room.id },
			data: { hostId: player.id }
		});

		// Room creation doesn't need its own broadcast
		// since the host player joining is broadcasted below

		// Broadcast player-joined event for real-time updates
		await supabaseRealtime.broadcast(room.id, RealtimeEventEnum.PLAYER_JOINED, {
			player: {
				id: player.id,
				nickname: player.nickname,
				isHost: player.isHost,
				cardId: player.cardId
			}
		});

		return {
			success: true,
			room: {
				...room,
				players: [player],
			},
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

		// Create a new player in the room
		const player = await prisma.player.create({
			data: {
				nickname,
				isHost: false,
				cardId: '',
				markedNumbers: [],
				roomId: room.id,
			}
		});

		// Broadcast player joined event for real-time updates
		await supabaseRealtime.broadcast(room.id, RealtimeEventEnum.PLAYER_JOINED, {
			player: {
				id: player.id,
				nickname: player.nickname,
				isHost: player.isHost,
				cardId: player.cardId
			}
		});

		return {
			success: true,
			room: {
				...room,
				players: [...(room.players || []), player],
			},
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

		// Broadcast event based on the new status
		if (status === 'playing') {
			await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.GAME_STARTED, {
				status: status
			});
		} else if (status === 'ended') {
			await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.GAME_ENDED, {
				status: status
			});
		}

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

		// Get room and player details before deletion for broadcasting
		const room = await prisma.room.findUnique({ where: { id: roomId }, include: { players: true } });
		const player = await prisma.player.findUnique({ where: { id: playerId } });
		if (!room) return { success: true };

		// Broadcast player left event for real-time updates (if player still exists)
		if (player) {
			await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.PLAYER_LEFT, {
				playerId: playerId,
				nickname: player.nickname
			});
		}

		if (room.players.length === 0) {
			await prisma.room.delete({ where: { id: roomId } });
		}

		return { success: true };
	} catch (error) {
		console.error('Failed to leave room:', error);
		return { success: false, error: 'Failed to leave room' };
	}
}