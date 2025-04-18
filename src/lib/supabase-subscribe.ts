import { useEffect } from 'react';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { RealtimeEventEnum } from '@/lib/enums';
import { getRoomWithPlayersAction } from '@/server/actions/room';
import { useGameStore } from '@/stores/useGameStore';
import { RoomStatus } from '@prisma/client';

/**
 * Custom hook to manage Supabase realtime subscriptions for a specific room.
 * Handles events like player joining/leaving, game starting, and card selection.
 * Updates the game state using useGameStore.
 *
 * @param roomId The ID of the room to subscribe to.
 */
export function useRoomRealtime(roomId: string | undefined) {
	const supabaseRealtime = useSupabaseRealtime(roomId || '');
	// Access the game store state and setters
	const { setPlayersInRoom, setRoom } = useGameStore(); // Removed getState as it's used directly

	useEffect(() => {
		// Don't proceed if roomId is not yet available
		if (!roomId) {
			console.log('useRoomRealtime: No roomId provided, skipping subscription setup.');
			return;
		}
		console.log(`useRoomRealtime: Setting up subscriptions for room ${roomId}`);

		// Array to hold the unsubscribe functions directly
		const unsubscribeFunctions: (() => void)[] = [];

		const subscribeAndTrack = (event: RealtimeEventEnum, callback: (payload: unknown) => void) => {
			// Assuming subscribe returns the unsubscribe function directly
			const unsubscribe = supabaseRealtime.subscribe(event, callback);
			if (typeof unsubscribe === 'function') {
				unsubscribeFunctions.push(unsubscribe);
			} else {
				console.warn(`useRoomRealtime: Subscription for ${event} did not return a valid unsubscribe function.`);
			}
		};

		// Subscribe to PLAYER_JOINED events
		subscribeAndTrack(RealtimeEventEnum.PLAYER_JOINED, async (payload: unknown) => {
			console.log('Player joined event received (from hook)', payload);
			const currentRoomId = useGameStore.getState().room?.id; // Get latest room id from store

			if (!currentRoomId) return; // Ensure room still exists in state

			// Fetch updated room data to include the new player
			const response = await getRoomWithPlayersAction(currentRoomId);

			if (!response.success || !response.room) {
				console.error('useRoomRealtime: Failed to fetch room after PLAYER_JOINED', response.error);
				return;
			}

			console.log('useRoomRealtime: Updating players after PLAYER_JOINED', response.room.players);
			setPlayersInRoom(response.room.players || []);
		});

		// Subscribe to PLAYER_LEFT events
		subscribeAndTrack(RealtimeEventEnum.PLAYER_LEFT, async (payload: unknown) => {
			console.log('Player left event received (from hook)', payload);
			const currentRoomId = useGameStore.getState().room?.id;
			if (!currentRoomId) return;
			// Fetch updated room data to reflect the player leaving
			const response = await getRoomWithPlayersAction(currentRoomId);
			if (response.success && response.room) {
				console.log('useRoomRealtime: Updating players after PLAYER_LEFT', response.room.players);
				setPlayersInRoom(response.room.players || []);
			} else {
				console.error('useRoomRealtime: Failed to fetch room after PLAYER_LEFT', response.error);
			}
		});

		// Subscribe to GAME_STARTED events
		subscribeAndTrack(RealtimeEventEnum.GAME_STARTED, (payload: unknown) => {
			console.log('Game started event received (from hook)', payload);
			const currentRoom = useGameStore.getState().room;
			// Update room status if it's not already 'playing'
			if (currentRoom && currentRoom.status !== RoomStatus.playing) {
				console.log('useRoomRealtime: Updating room status to playing');
				setRoom({
					...currentRoom,
					status: RoomStatus.playing,
				});
			}
		});

		// Subscribe to CARD_SELECTED events
		subscribeAndTrack(RealtimeEventEnum.CARD_SELECTED, async (payload: unknown) => {
			console.log('Card selected event received (from hook)', payload);
			const currentRoomId = useGameStore.getState().room?.id;
			if (!currentRoomId) return;
			// Fetch updated room data to reflect card selections
			const response = await getRoomWithPlayersAction(currentRoomId);
			if (response.success && response.room) {
				console.log('useRoomRealtime: Updating players after CARD_SELECTED', response.room.players);
				setPlayersInRoom(response.room.players || []);
			} else {
				console.error('useRoomRealtime: Failed to fetch room after CARD_SELECTED', response.error);
			}
		});

		// Cleanup function: Call all stored unsubscribe functions
		return () => {
			console.log(`useRoomRealtime: Cleaning up ${unsubscribeFunctions.length} subscriptions for room ${roomId}`);
			unsubscribeFunctions.forEach(unsub => {
				unsub(); // Call the unsubscribe function
			});
			// Clear the array after unsubscribing
			unsubscribeFunctions.length = 0;
		};
		// Dependencies for the useEffect hook
	}, [roomId, supabaseRealtime, setPlayersInRoom, setRoom]); // Removed getState from dependencies

	// This hook doesn't need to return anything; its purpose is to manage subscriptions side effect.
}