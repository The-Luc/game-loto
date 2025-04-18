import { useEffect } from 'react';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { RealtimeEventEnum } from '@/lib/enums';
import { getRoomWithPlayersAction } from '@/server/actions/room';
import { useGameStore } from '@/stores/useGameStore';
import { Player, Room, RoomStatus } from '@prisma/client';
import { BroadcastPayloadMap } from '../types/broadcast';

/**
 * Custom hook to manage Supabase realtime subscriptions for a specific room.
 * Handles events like player joining/leaving, game starting, and card selection.
 * Updates the game state using useGameStore.
 *
 * @param roomId The ID of the room to subscribe to.
 */
/**
 * Helper function to handle player joined events
 */
function handlePlayerJoined(payload: BroadcastPayloadMap[RealtimeEventEnum.PLAYER_JOINED], setPlayersInRoom: (players: Player[]) => void) {
	console.log('Player joined event received (from hook)', payload);
	const currentRoomId = useGameStore.getState().room?.id; // Get latest room id from store

	if (!currentRoomId) return; // Ensure room still exists in state

	// Fetch updated room data to include the new player
	return getRoomWithPlayersAction(currentRoomId).then(response => {
		if (!response.success || !response.room) {
			console.error('useRoomRealtime: Failed to fetch room after PLAYER_JOINED', response.error);
			return;
		}

		console.log('useRoomRealtime: Updating players after PLAYER_JOINED', response.room.players);
		setPlayersInRoom(response.room.players || []);
	});
}

/**
 * Helper function to handle player left events
 */
function handlePlayerLeft(payload: BroadcastPayloadMap[RealtimeEventEnum.PLAYER_LEFT], setPlayersInRoom: (players: Player[]) => void) {
	console.log('Player left event received (from hook)', payload);
	const currentRoomId = useGameStore.getState().room?.id;
	if (!currentRoomId) return;
	
	// Fetch updated room data to reflect the player leaving
	return getRoomWithPlayersAction(currentRoomId).then(response => {
		if (response.success && response.room) {
			console.log('useRoomRealtime: Updating players after PLAYER_LEFT', response.room.players);
			setPlayersInRoom(response.room.players || []);
		} else {
			console.error('useRoomRealtime: Failed to fetch room after PLAYER_LEFT', response.error);
		}
	});
}

/**
 * Helper function to handle game started events
 */
function handleGameStarted(payload: BroadcastPayloadMap[RealtimeEventEnum.GAME_STARTED], setRoom: (room: Room) => void) {
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
}

/**
 * Helper function to handle card selected events
 */
function handleCardSelected(payload: BroadcastPayloadMap[RealtimeEventEnum.CARD_SELECTED], setPlayersInRoom: (players: Player[]) => void) {
	console.log('Card selected event received (from hook)', payload);
	const currentRoomId = useGameStore.getState().room?.id;
	if (!currentRoomId) return;
	
	// Fetch updated room data to reflect card selections
	return getRoomWithPlayersAction(currentRoomId).then(response => {
		if (response.success && response.room) {
			console.log('useRoomRealtime: Updating players after CARD_SELECTED', response.room.players);
			setPlayersInRoom(response.room.players || []);
		} else {
			console.error('useRoomRealtime: Failed to fetch room after CARD_SELECTED', response.error);
		}
	});
}

/**
 * Setup all event subscriptions and return unsubscribe functions
 */
function setupSubscriptions(
	roomId: string,
	supabaseRealtime: ReturnType<typeof useSupabaseRealtime>,
	setPlayersInRoom: (players: Player[]) => void,
	setRoom: (room: Room) => void
): (() => void)[] {
	console.log(`Setting up subscriptions for room ${roomId}`);
	const unsubscribeFunctions: (() => void)[] = [];
	
	const subscribeAndTrack = <E extends keyof BroadcastPayloadMap>(
		event: E,
		callback: (payload: BroadcastPayloadMap[E]) => void
	) => {
		// for test, only subscribe to the event: PLAYER_JOINED
		if (event !== RealtimeEventEnum.PLAYER_JOINED) return;

		// Assuming subscribe returns the unsubscribe function directly
		const unsubscribe = supabaseRealtime.subscribe(event, callback);
		if (typeof unsubscribe === 'function') {
			unsubscribeFunctions.push(unsubscribe);
		} else {
			console.warn(`useRoomRealtime: Subscription for ${event} did not return a valid unsubscribe function.`);
		}
	};

	// Subscribe to PLAYER_JOINED events
	subscribeAndTrack(RealtimeEventEnum.PLAYER_JOINED, (payload) => 
		handlePlayerJoined(payload, setPlayersInRoom)
	);

	// Subscribe to PLAYER_LEFT events
	subscribeAndTrack(RealtimeEventEnum.PLAYER_LEFT, (payload) => 
		handlePlayerLeft(payload, setPlayersInRoom)
	);

	// Subscribe to GAME_STARTED events
	subscribeAndTrack(RealtimeEventEnum.GAME_STARTED, (payload) => 
		handleGameStarted(payload, setRoom)
	);

	// Subscribe to CARD_SELECTED events
	subscribeAndTrack(RealtimeEventEnum.CARD_SELECTED, (payload) => 
		handleCardSelected(payload, setPlayersInRoom)
	);

	return unsubscribeFunctions;
}

export function useRoomRealtime(roomId: string | undefined) {
	const supabaseRealtime = useSupabaseRealtime(roomId || '');
	// Access the game store state and setters
	const { setPlayersInRoom, setRoom } = useGameStore();

	useEffect(() => {
		// Don't proceed if roomId is not yet available
		if (!roomId) {
			console.log('useRoomRealtime: No roomId provided, skipping subscription setup.');
			return;
		}
		
		console.log(`useRoomRealtime: Preparing subscriptions for room ${roomId}`);
		
		// Track subscription state
		let subscriptionActive = false;
		let unsubscribeFunctions: (() => void)[] = [];
		
		// Create a timeout to delay subscription initialization
		const timer = setTimeout(() => {
			console.log(`useRoomRealtime: Initializing subscriptions for room ${roomId} after delay`);
			
			// Setup all subscriptions and get unsubscribe functions
			unsubscribeFunctions = setupSubscriptions(
				roomId,
				supabaseRealtime,
				setPlayersInRoom,
				setRoom
			);
			
			// Mark subscription as active
			subscriptionActive = true;
		}, 1000); // 1 second delay before setting up subscriptions

		// Cleanup function: Handle both timeout and subscriptions
		return () => {
			// If subscription hasn't been established yet, clear the timeout
			if (!subscriptionActive) {
				console.log(`useRoomRealtime: Cleaning up timer before subscriptions were established for room ${roomId}`);
				clearTimeout(timer);
			} else {
				// Otherwise, clean up all active subscriptions
				console.log(`useRoomRealtime: Cleaning up ${unsubscribeFunctions.length} active subscriptions for room ${roomId}`);
				unsubscribeFunctions.forEach(unsub => {
					unsub(); // Call the unsubscribe function
				});
			}
			// Clear the array after unsubscribing
			unsubscribeFunctions.length = 0;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId]);

	// This hook doesn't need to return anything; its purpose is to manage subscriptions side effect.
}