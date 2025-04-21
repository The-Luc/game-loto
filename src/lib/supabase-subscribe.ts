import { useEffect } from 'react';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { RealtimeEventEnum } from '@/lib/enums';
import { useGameStore } from '@/stores/useGameStore';
import { Player, Room, RoomStatus } from '@prisma/client';
import { BroadcastPayloadMap } from '../types/broadcast';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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
function handlePlayerJoined(
  payload: BroadcastPayloadMap[RealtimeEventEnum.PLAYER_JOINED],
  setPlayersInRoom: (players: Player[]) => void
) {
  console.log('Player joined event received (from hook)', payload);
  const gameState = useGameStore.getState();
  const currentRoomId = gameState.room?.id;
  const currentPlayers = gameState.playersInRoom;

  if (!currentRoomId) return; // Ensure room still exists in state
  if (!payload.player) {
    console.error(
      'useRoomRealtime: Player data missing from PLAYER_JOINED payload'
    );
    return;
  }

  // Convert payload data to Player type
  const newPlayer = payload.player as Player;

  // Check if player already exists in the list (avoid duplicates)
  const playerExists = currentPlayers.some(
    (player) => player.id === newPlayer.id
  );
  if (playerExists) {
    console.log(
      'useRoomRealtime: Player already in room list, skipping update'
    );
    return;
  }

  // Add the new player to the existing players list
  const updatedPlayers = [...currentPlayers, newPlayer];
  console.log(
    'useRoomRealtime: Updating players after PLAYER_JOINED',
    updatedPlayers
  );
  setPlayersInRoom(updatedPlayers);
}

/**
 * Helper function to handle player left events
 */
function handlePlayerLeft(
  payload: BroadcastPayloadMap[RealtimeEventEnum.PLAYER_LEFT],
  setPlayersInRoom: (players: Player[]) => void
) {
  console.log('Player left event received (from hook)', payload);
  const gameState = useGameStore.getState();
  const currentRoomId = gameState.room?.id;
  const currentPlayers = gameState.playersInRoom;

  if (!currentRoomId) return;
  if (!payload.playerId) {
    console.error(
      'useRoomRealtime: Player ID missing from PLAYER_LEFT payload'
    );
    return;
  }

  // Filter out the player who left
  const updatedPlayers = currentPlayers.filter(
    (player) => player.id !== payload.playerId
  );

  console.log(
    'useRoomRealtime: Updating players after PLAYER_LEFT',
    updatedPlayers
  );
  setPlayersInRoom(updatedPlayers);
}

/**
 * Helper function to handle game started events
 */
function handleGameStarted(
  payload: BroadcastPayloadMap[RealtimeEventEnum.GAME_STARTED],
  setRoom: (room: Room) => void
) {
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
function handleCardSelected(
  payload: BroadcastPayloadMap[RealtimeEventEnum.CARD_SELECTED],
  setPlayersInRoom: (players: Player[]) => void
) {
  console.log('Card selected event received (from hook)', payload);
  const gameState = useGameStore.getState();
  const currentRoomId = gameState.room?.id;
  const currentPlayers = gameState.playersInRoom;

  if (!currentRoomId) return;
  if (!payload.playerId || !payload.selectedCardIds) {
    console.error(
      'useRoomRealtime: Required data missing from CARD_SELECTED payload'
    );
    return;
  }

  // Find the player who selected the card
  const playerIndex = currentPlayers.findIndex(
    (player) => player.id === payload.playerId
  );
  if (playerIndex === -1) {
    console.error('useRoomRealtime: Player not found for CARD_SELECTED event');
    return;
  }

  // Create a new players array with the updated player
  const updatedPlayers = [...currentPlayers];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    selectedCardIds: payload.selectedCardIds,
  };

  console.log(
    'useRoomRealtime: Updating players after CARD_SELECTED',
    updatedPlayers
  );
  setPlayersInRoom(updatedPlayers);
}

/**
 * Helper function to handle number called events
 */
function handleNumberCalled(
  payload: BroadcastPayloadMap[RealtimeEventEnum.NUMBER_CALLED],
  setCalledNumbers: (numbers: number[]) => void
) {
  console.log('Number called event received (from hook)', payload);

  if (!payload.number || !payload.calledNumbers) {
    console.error(
      'useRoomRealtime: Required data missing from NUMBER_CALLED payload'
    );
    return;
  }

  setCalledNumbers(payload.calledNumbers);
}

/**
 * Helper function to handle winner declaration events
 */
function handleWinnerDeclared(
  payload: BroadcastPayloadMap[RealtimeEventEnum.WINNER_DECLARED],
  setRoom: (room: Room) => void,
  setWinner: (player: Player | null) => void
) {
  console.log('Winner declared event received (from hook)', payload);
  const gameState = useGameStore.getState();
  const currentRoomId = gameState.room?.id;
  const currentPlayers = gameState.playersInRoom;

  if (!currentRoomId) return;
  if (!payload.playerId || !payload.winnerName) {
    console.error(
      'useRoomRealtime: Required data missing from WINNER_DECLARED payload'
    );
    return;
  }

  // Find the player who won
  const winningPlayer = currentPlayers.find(
    (player) => player.id === payload.playerId
  );
  if (!winningPlayer) {
    console.error(
      'useRoomRealtime: Winning player not found for WINNER_DECLARED event'
    );
    return;
  }

  // Update the game state with the winner
  setWinner(winningPlayer);

  // Update the room status to ended
  if (gameState.room) {
    setRoom({
      ...gameState.room,
      status: RoomStatus.ended,
      winnerId: payload.playerId,
    });
  }

  // Show a toast notification for all players
  const { toast } = require('sonner');
  toast.success(
    `${payload.winnerName} has won the game with a complete column! 🎉`
  );
}

/**
 * Setup all event subscriptions and return unsubscribe functions
 */
function setupSubscriptions(
  roomId: string,
  supabaseRealtime: ReturnType<typeof useSupabaseRealtime>,
  setPlayersInRoom: (players: Player[]) => void,
  setRoom: (room: Room) => void,
  setWinner: (player: Player | null) => void,
  setCalledNumbers: (numbers: number[]) => void
): (() => void)[] {
  console.log(`Setting up subscriptions for room ${roomId}`);
  const unsubscribeFunctions: (() => void)[] = [];

  const subscribeAndTrack = <E extends keyof BroadcastPayloadMap>(
    event: E,
    callback: (payload: BroadcastPayloadMap[E]) => void
  ) => {
    // Assuming subscribe returns the unsubscribe function directly
    const unsubscribe = supabaseRealtime.subscribe(event, callback);
    if (typeof unsubscribe === 'function') {
      unsubscribeFunctions.push(unsubscribe);
    } else {
      console.warn(
        `useRoomRealtime: Subscription for ${event} did not return a valid unsubscribe function.`
      );
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

  // Subscribe to WINNER_DECLARED events
  subscribeAndTrack(RealtimeEventEnum.WINNER_DECLARED, (payload) =>
    handleWinnerDeclared(payload, setRoom, setWinner)
  );

  // Subscribe to NUMBER_CALLED events
  subscribeAndTrack(RealtimeEventEnum.NUMBER_CALLED, (payload) =>
    handleNumberCalled(payload, setCalledNumbers)
  );

  return unsubscribeFunctions;
}

/**
 * Custom hook to manage Supabase realtime subscriptions for a specific room with UI actions
 * Handles events like player joining/leaving, game starting, and card selection.
 * Also manages UI-specific actions like toast notifications, game logs, and confetti animations.
 *
 * @param roomId The ID of the room to subscribe to.
 * @param uiOptions Options for UI-specific actions
 */
export function useRoomRealtime(
  roomId: string | undefined,
  uiOptions?: {
    addToGameLog?: (message: string) => void;
    setShowWinModal?: (show: boolean) => void;
    setWinnerInfo?: (
      info: { name: string; cardId: string; winningRowIndex: number } | null
    ) => void;
    setIsAutoCalling?: (isAutoCalling: boolean) => void;
    setAutoCallInterval?: (interval: NodeJS.Timeout | null) => void;
    autoCallInterval?: NodeJS.Timeout | null;
  }
) {
  const supabaseRealtime = useSupabaseRealtime(roomId || '');
  // Access the game store state and setters
  const { setPlayersInRoom, setRoom, setWinner, setCalledNumbers } =
    useGameStore();

  useEffect(() => {
    // Don't proceed if roomId is not yet available
    if (!roomId) {
      console.log(
        'useRoomRealtime: No roomId provided, skipping subscription setup.'
      );
      return;
    }

    console.log(`useRoomRealtime: Preparing subscriptions for room ${roomId}`);

    // Track subscription state
    let subscriptionActive = false;
    let unsubscribeFunctions: (() => void)[] = [];
    console.log('Check 1 ✅');

    // Register UI event handlers directly inside subscription callbacks
    const enhancedSetupSubscriptions = () => {
      const basicSubscriptions = setupSubscriptions(
        roomId,
        supabaseRealtime,
        setPlayersInRoom,
        setRoom,
        setWinner,
        setCalledNumbers
      );

      // Add UI-specific event handlers
      const uiSubscriptions: (() => void)[] = [];

      // Winner declared events - UI specific handling
      if (
        uiOptions?.setShowWinModal ||
        uiOptions?.setWinnerInfo ||
        uiOptions?.addToGameLog
      ) {
        const unsub = supabaseRealtime.subscribe(
          RealtimeEventEnum.WINNER_DECLARED,
          (payload) => {
            console.log('Winner declared UI event received:', payload);

            // Update winner info and show modal if handlers are provided
            if (
              uiOptions.setWinnerInfo &&
              payload.winnerName &&
              payload.cardId &&
              payload.winningRowIndex !== undefined
            ) {
              uiOptions.setWinnerInfo({
                name: payload.winnerName,
                cardId: payload.cardId,
                winningRowIndex: payload.winningRowIndex,
              });
            }

            if (uiOptions.setShowWinModal) {
              uiOptions.setShowWinModal(true);
            }

            if (uiOptions.addToGameLog && payload.winnerName) {
              uiOptions.addToGameLog(`${payload.winnerName} đã chiến thắng!`);
            }

            // Trigger confetti celebration
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        );
        uiSubscriptions.push(unsub);
      }

      // Number called events - UI specific handling
      if (uiOptions?.addToGameLog) {
        const unsub = supabaseRealtime.subscribe(
          RealtimeEventEnum.NUMBER_CALLED,
          (payload) => {
            console.log('Number called UI event received:', payload);
            if (payload.number) {
              uiOptions.addToGameLog?.(`Số ${payload.number} đã được gọi`);
            }
          }
        );
        uiSubscriptions.push(unsub);
      }

      // Player joined events - UI specific handling
      if (uiOptions?.addToGameLog) {
        const unsub = supabaseRealtime.subscribe(
          RealtimeEventEnum.PLAYER_JOINED,
          (payload) => {
            console.log('Player joined UI event received:', payload);
            if (payload.player?.nickname) {
              uiOptions.addToGameLog?.(
                `${payload.player.nickname} đã tham gia phòng`
              );
              toast.info(`${payload.player.nickname} đã tham gia phòng!`);
            }
          }
        );
        uiSubscriptions.push(unsub);
      }

      // Player left events - UI specific handling
      if (uiOptions?.addToGameLog) {
        const unsub = supabaseRealtime.subscribe(
          RealtimeEventEnum.PLAYER_LEFT,
          (payload) => {
            console.log('Player left UI event received:', payload);
            if (payload.playerNickname) {
              uiOptions.addToGameLog?.(
                `${payload.playerNickname} đã rời phòng`
              );
              toast.info(`${payload.playerNickname} đã rời phòng`);
            }
          }
        );
        uiSubscriptions.push(unsub);
      }

      // Game started events - UI specific handling
      if (uiOptions?.addToGameLog) {
        const unsub = supabaseRealtime.subscribe(
          RealtimeEventEnum.GAME_STARTED,
          () => {
            console.log('Game started UI event received');
            uiOptions.addToGameLog?.('Trò chơi đã bắt đầu');
            toast.success('Trò chơi đã bắt đầu!');
          }
        );
        uiSubscriptions.push(unsub);
      }

      // Game ended events - UI specific handling
      if (
        uiOptions?.addToGameLog ||
        uiOptions?.setIsAutoCalling ||
        uiOptions?.setAutoCallInterval
      ) {
        const unsub = supabaseRealtime.subscribe(
          RealtimeEventEnum.GAME_ENDED,
          () => {
            console.log('Game ended UI event received');
            uiOptions.addToGameLog?.('Trò chơi đã kết thúc');

            // Stop auto-calling if it's active
            if (
              uiOptions.setIsAutoCalling &&
              uiOptions.setAutoCallInterval &&
              uiOptions.autoCallInterval
            ) {
              clearInterval(uiOptions.autoCallInterval);
              uiOptions.setAutoCallInterval(null);
              uiOptions.setIsAutoCalling(false);
            }
          }
        );
        uiSubscriptions.push(unsub);
      }

      return [...basicSubscriptions, ...uiSubscriptions];
    };

    // Create a timeout to delay subscription initialization
    const timer = setTimeout(() => {
      console.log(
        `useRoomRealtime: Initializing subscriptions for room ${roomId} after delay`
      );
      console.log('Check 2 ✅');

      // Setup all subscriptions with enhanced UI handlers
      unsubscribeFunctions = enhancedSetupSubscriptions();

      // Mark subscription as active
      subscriptionActive = true;
    }, 1000); // 1 second delay before setting up subscriptions

    // Cleanup function: Handle both timeout and subscriptions
    return () => {
      // If subscription hasn't been established yet, clear the timeout
      if (!subscriptionActive) {
        console.log(
          `useRoomRealtime: Cleaning up timer before subscriptions were established for room ${roomId}`
        );
        clearTimeout(timer);
      } else {
        // Otherwise, clean up all active subscriptions
        console.log(
          `useRoomRealtime: Cleaning up ${unsubscribeFunctions.length} active subscriptions for room ${roomId}`
        );
        unsubscribeFunctions.forEach((unsub) => {
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
