'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { GameState, LoToCard } from '@/types';
import { createRoomAction, joinRoomAction, leaveRoomAction } from '../actions/room';
import { Room, RoomStatus } from '@prisma/client';

interface GameContextType {
  gameState: GameState;
  nickname: string;
  setNickname: (name: string) => void;
  createRoom: () => Promise<string>;
  joinRoom: (code: string, nickname: string) => Promise<boolean>;
  leaveRoom: () => void;
  startGame: () => void;
  kickPlayer: (playerId: string) => void;
  selectCard: (cardId: string) => void;
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

  // Subscribe to room changes when we have a room
  useEffect(() => {
    if (!gameState.room?.id) return;

    const roomChannel = supabase
      .channel(`room:${gameState.room.id}`)
      .on('broadcast', { event: 'room_update' }, payload => {
        setGameState(prevState => ({
          ...prevState,
          room: payload.payload as Room,
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [gameState.room?.id]);

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

      // In a real implementation, we would save this to Supabase
      // For now, we'll just update our local state
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
    // In a real implementation, this would happen through Supabase Realtime

    return true;
  };

  // Leave the current room
  const leaveRoom = async () => {
    if (!gameState.room || !gameState.player) return;
    const roomId = gameState.room.id;
    const playerId = gameState.player.id;

    const { success } = await leaveRoomAction(roomId, playerId);

    if (!success) return;

    // const updatedPlayers = gameState.room?.players?.filter(
    //   player => player.id !== gameState.player?.id
    // );

    // if (updatedPlayers?.length > 0) {
    // Update room with remaining players

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime

    // Clear local state
    setGameState({});
  };

  // Start the game (host only)
  const startGame = () => {
    if (!gameState.room || !gameState.player?.isHost) return;

    const updatedRoom = {
      ...gameState.room,
      status: RoomStatus.selecting,
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
    });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
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
  const selectCard = (cardId: string) => {
    if (!gameState.room || !gameState.player) return;
    if (gameState.room.status !== RoomStatus.selecting) return;

    const updatedPlayer = {
      ...gameState.player,
      cardId,
    };

    setGameState({
      ...gameState,
      player: updatedPlayer,
    });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Mark a number on player's card
  const markNumber = (number: number) => {
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

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Call the next number (host only)
  const callNextNumber = () => {
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

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Toggle auto-calling of numbers
  const toggleAutoCall = () => {
    if (!gameState.player?.isHost) return;

    if (isAutoCallingActive && autoCallInterval) {
      clearInterval(autoCallInterval);
      setAutoCallInterval(null);
      setIsAutoCallingActive(false);
    } else {
      const interval = setInterval(() => {
        callNextNumber();
      }, 5000); // 5 seconds interval

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
