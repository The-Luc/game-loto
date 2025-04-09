'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseRealtime } from '@/lib/supabase';
import { GameState } from '@/types';
import { createRoomAction, joinRoomAction, leaveRoomAction } from '../actions/room';
import { Room, RoomStatus, Player } from '@prisma/client';
import { RealtimeEventEnum } from '../enum';

interface GameContextType {
  gameState: GameState;
  nickname: string;
  setNickname: (name: string) => void;
  createRoom: () => Promise<string>;
  joinRoom: (code: string, nickname: string) => Promise<boolean>;
  leaveRoom: () => void;
  startGame: () => void;
  kickPlayer: (playerId: string) => void;
  selectCard: (cardId: string) => Promise<void>;
  markNumber: (number: number) => void;
  callNextNumber: () => void;
  toggleAutoCall: () => void;
  isAutoCallingActive: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({});
  const [nickname, setNickname] = useState<string>('');
  const [isAutoCallingActive, setIsAutoCallingActive] = useState<boolean>(false);
  const [autoCallInterval, setAutoCallInterval] = useState<NodeJS.Timeout | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  // Subscribe to room changes when we have a room
  useEffect(() => {
    if (!gameState.room?.id) return;

    // Set up subscriptions for various game events
    const unsubscribers: Array<() => void> = [];

    // Game started event
    const roomUpdateUnsub = supabaseRealtime.subscribe(
      gameState.room.id,
      RealtimeEventEnum.GAME_STARTED,
      payload => {
        console.log('🚀 ~ useEffect ~ GAME_STARTED EVENT:', payload);
        if (payload.room) {
          setGameState(prevState => ({
            ...prevState,
            room: payload.room as Room,
          }));
        }
      }
    );
    if (roomUpdateUnsub) unsubscribers.push(roomUpdateUnsub);

    // Player joined event
    const playerJoinedUnsub = supabaseRealtime.subscribe(
      gameState.room.id,
      RealtimeEventEnum.PLAYER_JOINED,
      payload => {
        console.log('🚀 ~ useEffect ~ PLAYER_JOINED EVENT:', payload);
        if (payload.room) {
          setGameState(prevState => ({
            ...prevState,
            room: payload.room as Room,
          }));
        }
      }
    );
    if (playerJoinedUnsub) unsubscribers.push(playerJoinedUnsub);

    // Player left event
    const playerLeftUnsub = supabaseRealtime.subscribe(
      gameState.room.id,
      RealtimeEventEnum.PLAYER_LEFT,
      payload => {
        if (payload.room) {
          setGameState(prevState => ({
            ...prevState,
            room: payload.room as Room,
          }));
        }
      }
    );
    if (playerLeftUnsub) unsubscribers.push(playerLeftUnsub);

    // Number called event
    const numberCalledUnsub = supabaseRealtime.subscribe(
      gameState.room.id,
      RealtimeEventEnum.NUMBER_CALLED,
      payload => {
        if (payload.room) {
          setGameState(prevState => ({
            ...prevState,
            room: {
              ...prevState.room,
              calledNumbers: [...(prevState.room?.calledNumbers || []), payload.number],
            },
          }));
        }
      }
    );
    if (numberCalledUnsub) unsubscribers.push(numberCalledUnsub);

    // Card selected event
    const cardSelectedUnsub = supabaseRealtime.subscribe(
      gameState.room.id,
      RealtimeEventEnum.CARD_SELECTED,
      payload => {
        console.log('🚀 ~ useEffect ~ payload:', payload);
        if (payload?.playerId && typeof payload.playerId === 'string') {
          const playerId = payload.playerId;
          const cardId = payload.cardId as string;
          setGameState(prevState => ({
            ...prevState,
            readyPlayerIds: [...(prevState.readyPlayerIds || []), playerId],
            room: {
              ...prevState.room,
              players: (prevState.room?.players || []).map(p =>
                p.id === playerId ? { ...p, cardId } : p
              ),
            },
          }));
        }
      }
    );
    if (cardSelectedUnsub) unsubscribers.push(cardSelectedUnsub);

    // Card updated event
    const cardUpdatedUnsub = supabaseRealtime.subscribe(
      gameState.room.id,
      RealtimeEventEnum.CARD_UPDATED,
      payload => {
        if (
          payload.player &&
          typeof payload.player === 'object' &&
          'id' in payload.player &&
          payload.player.id === gameState.player?.id
        ) {
          setGameState(prevState => ({
            ...prevState,
            player: payload.player as Player,
          }));
        }
      }
    );
    if (cardUpdatedUnsub) unsubscribers.push(cardUpdatedUnsub);

    // Track presence of the current player
    let presenceUnsubscriber;
    if (gameState.player) {
      presenceUnsubscriber = supabaseRealtime.trackPresence(
        gameState.room.id,
        gameState.player.id,
        {
          nickname: gameState.player.nickname,
          isHost: gameState.player.isHost,
          cardId: gameState.player.cardId || null,
        }
      );
      if (presenceUnsubscriber) unsubscribers.push(presenceUnsubscriber);
    }

    // Clean up subscriptions when component unmounts or roomId changes
    return () => {
      console.log('Cleaning up subscriptions 🍀 🍀🍀');
      unsubscribers.forEach(unsub => unsub && unsub());
    };
  }, [gameState.room?.id, gameState.player?.id]);

  useEffect(() => {
    if (gameState.player?.isHost && isAutoCallingActive) {
      callNextNumber();
    }
  }, [trigger, gameState.player?.isHost, isAutoCallingActive]);

  // Clean up auto-calling on unmount
  useEffect(() => {
    return () => {
      if (autoCallInterval) {
        clearInterval(autoCallInterval);
      }
    };
  }, [autoCallInterval]);

  // Create a new room
  const createRoom = async (): Promise<string> => {
    try {
      // create room and player
      const { success, room, player } = await createRoomAction(nickname);
      if (!success) {
        return '';
      }

      setGameState({
        room: room,
        player: player,
      });

      return room?.code || '';
    } catch (error) {
      console.error('Failed to create room:', error);
      return '';
    }
  };

  // Join an existing room
  const joinRoom = async (code: string, nickname: string): Promise<boolean> => {
    const { success, room, player } = await joinRoomAction(code, nickname);

    if (!success) return false;

    setGameState({
      room,
      player,
    });

    // Broadcast room update to other players
    if (room?.id) {
      await supabaseRealtime.broadcast(room.id, RealtimeEventEnum.PLAYER_JOINED, {
        room,
        player,
      });
    }

    return true;
  };

  // Leave the current room
  const leaveRoom = async () => {
    if (!gameState.room || !gameState.player) return;
    const roomId = gameState.room.id;
    const playerId = gameState.player.id;

    const result = await leaveRoomAction(roomId, playerId);

    if (!result.success) return;

    // Broadcast player left event to other players
    await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.PLAYER_LEFT, {
      playerId,
    });

    // Clear local state
    setGameState({});
  };

  // Start the game (host only)
  const startGame = async () => {
    if (!gameState.room || !gameState.player?.isHost) return;

    const updatedRoom = {
      ...gameState.room,
      status: RoomStatus.playing,
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
    });

    // Broadcast room update to other players
    await supabaseRealtime.broadcast(gameState.room.id, RealtimeEventEnum.GAME_STARTED, {
      room: updatedRoom,
    });
  };

  // Kick a player (host only)
  const kickPlayer = (playerId: string) => {
    if (!gameState.room || !gameState.player?.isHost) return;
    if (playerId === gameState.player.id) return; // Can't kick yourself

    // const updatedPlayers = gameState.room.players.filter(
    //   player => player.id !== playerId
    // );

    // const updatedRoom = {
    //   ...gameState.room,
    //   players: updatedPlayers,
    // };

    // setGameState({
    //   ...gameState,
    //   room: updatedRoom,
    // });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Select a card during the selection phase
  const selectCard = async (cardId: string) => {
    if (!gameState.room || !gameState.player) return;
    // if (gameState.room.status !== RoomStatus.selecting) return;

    const updatedPlayer = {
      ...gameState.player,
      cardId,
    };

    setGameState({
      ...gameState,
      player: updatedPlayer,
      readyPlayerIds: [...(gameState.readyPlayerIds || []), gameState.player.id],
      room: {
        ...gameState.room,
        players: (gameState.room?.players || []).map(p =>
          p.id === gameState.player?.id ? updatedPlayer : p
        ),
      },
    });

    // Broadcast card selection to other players
    await supabaseRealtime.broadcast(gameState.room.id, RealtimeEventEnum.CARD_SELECTED, {
      playerId: gameState.player.id,
      cardId,
    });
  };

  // Mark a number on player's card
  const markNumber = async (number: number) => {
    if (!gameState.room || !gameState.player) return;
    if (gameState.room.status !== RoomStatus.playing) return;

    const markedNumbers = [...(gameState.player.markedNumbers || []), number];

    const updatedPlayer = {
      ...gameState.player,
      markedNumbers,
    };

    setGameState({
      ...gameState,
      player: updatedPlayer,
    });

    // Broadcast card update to other players
    await supabaseRealtime.broadcast(gameState.room.id, RealtimeEventEnum.CARD_UPDATED, {
      player: updatedPlayer,
    });
  };

  // Call the next number (host only)
  const callNextNumber = async () => {
    if (!gameState.room || !gameState.player?.isHost) return;
    if (gameState.room.status !== RoomStatus.playing) return;

    // Get all numbers that haven't been called yet (1-90)
    const calledNumbers = gameState.room.calledNumbers || [];
    const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
      num => !calledNumbers.includes(num)
    );

    if (availableNumbers.length === 0) return; // All numbers have been called

    // Pick a random number from the available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];

    const updatedRoom = {
      ...gameState.room,
      calledNumbers: [...calledNumbers, newNumber],
      currentNumber: newNumber,
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
    });

    // Broadcast number called to all players
    await supabaseRealtime.broadcast(gameState.room.id, RealtimeEventEnum.NUMBER_CALLED, {
      number: newNumber,
    });
  };

  // Toggle auto-calling of numbers
  const toggleAutoCall = () => {
    if (!gameState.player?.isHost) return;

    if (isAutoCallingActive && autoCallInterval) {
      clearInterval(autoCallInterval);
      setAutoCallInterval(null);
      setIsAutoCallingActive(false);
    } else {
      // Use a function reference that will always use the latest state
      const interval = setInterval(() => {
        setTrigger(prev => prev + 1);
      }, 4000); // 4 seconds interval

      setAutoCallInterval(interval);
      setIsAutoCallingActive(true);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        nickname,
        setNickname,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        kickPlayer,
        selectCard,
        markNumber,
        callNextNumber,
        toggleAutoCall,
        isAutoCallingActive,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
