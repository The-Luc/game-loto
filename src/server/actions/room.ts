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
				selectedCardIds: [],
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
				selectedCardIds: [],
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
				selectedCardIds: [],
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
				selectedCardIds: player.selectedCardIds
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
			// Payload should match GameStartedPayload: { startTime: string }
			await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.GAME_STARTED, {
				startTime: new Date().toISOString(), // Send start time
			});
		} else if (status === 'ended') {
			// Payload should match GameEndedPayload: { endTime: string, winner?: Player }
			// Winner determination logic is not here, send undefined for now.
			await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.GAME_ENDED, {
				endTime: new Date().toISOString(), // Send end time
				winner: undefined, // Winner logic needed separately
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
		// Get room and player details before deletion
		const room = await prisma.room.findUnique({ where: { id: roomId }, include: { players: true } });
		const player = await prisma.player.findUnique({ where: { id: playerId } });

		// Validate player first
		if (!player) {
			console.warn(`leaveRoomAction: Player ${playerId} not found.`);
			return { success: false, error: 'Player not found.' };
		}

		// Validate room exists
		if (!room) {
			console.warn(`leaveRoomAction: Room ${roomId} not found.`);
			return { success: false, error: 'Room not found.' };
		}

		// Validate player is in the correct room
		if (player.roomId !== room.id) {
			console.warn(`leaveRoomAction: Player ${playerId} is not in room ${roomId}.`);
			return { success: false, error: 'Player is not in this room.' };
		}

		// Store nickname for logging before deleting
		const playerNickname = player.nickname;
		console.log(`leaveRoomAction: Player ${playerNickname} (${playerId}) attempting to leave room ${roomId}.`);

		// Remove player from the room
		await prisma.player.delete({
			where: { id: playerId }
		});

		// Broadcast player left event
		// Ensure payload matches PlayerLeftPayload: only playerId
		await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.PLAYER_LEFT, {
			playerId: playerId,
		});

		// Use stored nickname in log message
		console.log(`leaveRoomAction: Player ${playerNickname} (${playerId}) successfully left room ${roomId}.`);

		// Check remaining players (use updated player count from the room query)
		const remainingPlayersCount = room.players.filter(p => p.id !== playerId).length;
		if (remainingPlayersCount === 0) {
			console.log(`leaveRoomAction: No players left in room ${roomId}. Deleting room.`);
			await prisma.room.delete({ where: { id: roomId } });
		} else if (player.isHost) {
			// If the leaving player was the host, handle host migration
			console.log(`leaveRoomAction: Host ${playerNickname} (${playerId}) left room ${roomId}. Handling host migration...`);
			// Fetch remaining players again AFTER deletion to be sure
			const remainingPlayers = await prisma.player.findMany({
				where: { roomId },
				orderBy: { createdAt: 'asc' }, // oldest player first
			});

			if (remainingPlayers.length > 0) {
				const newHost = remainingPlayers[0];
				await prisma.room.update({
					where: { id: roomId },
					data: { hostId: newHost.id },
				});
				await prisma.player.update({
					where: { id: newHost.id },
					data: { isHost: true },
				});
				console.log(`leaveRoomAction: Assigned host to ${newHost.nickname} (${newHost.id}) in room ${roomId}.`);
			}
			// No else needed here, as deletion happens if remainingPlayersCount is 0 above
		}

		return { success: true };
	} catch (error) {
		console.error('Failed to leave room:', error);
		return { success: false, error: 'Failed to leave room' };
	}
}