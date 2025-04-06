'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { GameState, Player, Room, LoToCard } from '@/types';
import { generateRoomCode, generateMultipleCards } from '@/lib/game-utils';

interface GameContextType {
  gameState: GameState;
  nickname: string;
  setNickname: (name: string) => void;
  createRoom: () => Promise<string>;
  joinRoom: (code: string) => Promise<boolean>;
  leaveRoom: () => void;
  startGame: () => void;
  kickPlayer: (playerId: string) => void;
  selectCard: (card: LoToCard) => void;
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
    const roomCode = generateRoomCode();
    const playerId = Math.random().toString(36).substring(2, 15);

    const newPlayer: Player = {
      id: playerId,
      nickname,
      isHost: true,
      markedNumbers: [],
    };

    const newRoom: Room = {
      id: Math.random().toString(36).substring(2, 15),
      code: roomCode,
      hostId: playerId,
      players: [newPlayer],
      status: 'waiting',
      calledNumbers: [],
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, we woul save this to Supabase
    // For now, we'll just update our local state
    setGameState({
      room: newRoom,
      player: newPlayer,
    });

    return roomCode;
  };

  // Join an existing room
  const joinRoom = async (code: string): Promise<boolean> => {
    // In a real implementation, we would fetch the room from Supabase
    // For now, we'll simulate this

    // Simulate room lookup
    if (gameState.room?.code === code) {
      // Room exists in our state (for demo purposes)
      const playerId = Math.random().toString(36).substring(2, 15);

      const newPlayer: Player = {
        id: playerId,
        nickname,
        isHost: false,
        markedNumbers: [],
      };

      const updatedRoom = {
        ...gameState.room,
        players: [...gameState.room.players, newPlayer],
      };

      setGameState({
        room: updatedRoom,
        player: newPlayer,
      });

      // Broadcast room update to other players
      // In a real implementation, this would happen through Supabase Realtime

      return true;
    }

    // Room not found
    return false;
  };

  // Leave the current room
  const leaveRoom = () => {
    if (!gameState.room || !gameState.player) return;

    const updatedPlayers = gameState.room.players.filter(
      player => player.id !== gameState.player?.id
    );

    // If there are still players in the room
    if (updatedPlayers.length > 0) {
      // If the leaving player was the host, assign a new host
      let updatedRoom = { ...gameState.room, players: updatedPlayers };

      if (gameState.player.isHost && updatedPlayers.length > 0) {
        updatedRoom = {
          ...updatedRoom,
          hostId: updatedPlayers[0].id,
          players: updatedPlayers.map((p, index) =>
            index === 0 ? { ...p, isHost: true } : p
          ),
        };
      }

      // Broadcast room update to other players
      // In a real implementation, this would happen through Supabase Realtime
    } else {
      // If no players left, the room would be deleted in a real implementation
    }

    // Clear local state
    setGameState({});
  };

  // Start the game (host only)
  const startGame = () => {
    if (!gameState.room || !gameState.player?.isHost) return;

    // Generate 10 random cards for each player to choose from
    const cards = generateMultipleCards(10);

    const updatedRoom: Room = {
      ...gameState.room,
      status: 'selecting',
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
      availableCards: cards,
    });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Kick a player (host only)
  const kickPlayer = (playerId: string) => {
    if (!gameState.room || !gameState.player?.isHost) return;
    if (playerId === gameState.player.id) return; // Can't kick yourself

    const updatedPlayers = gameState.room.players.filter(
      player => player.id !== playerId
    );

    const updatedRoom = {
      ...gameState.room,
      players: updatedPlayers,
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
    });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Select a card during the selection phase
  const selectCard = (card: LoToCard) => {
    if (!gameState.room || !gameState.player) return;
    if (gameState.room.status !== 'selecting') return;

    const updatedPlayer = {
      ...gameState.player,
      selectedCard: card,
    };

    const updatedPlayers = gameState.room.players.map(player =>
      player.id === gameState.player?.id ? updatedPlayer : player
    );

    // Check if all players have selected a card
    const allSelected = updatedPlayers.every(player => player.selectedCard);

    const updatedRoom: Room = {
      ...gameState.room,
      players: updatedPlayers,
      status: allSelected ? 'playing' : 'selecting',
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
      player: updatedPlayer,
      availableCards: undefined, // Clear available cards after selection
    });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Mark a number on player's card
  const markNumber = (number: number) => {
    if (!gameState.room || !gameState.player) return;
    if (gameState.room.status !== 'playing') return;

    const markedNumbers = [...(gameState.player.markedNumbers || []), number];

    const updatedPlayer = {
      ...gameState.player,
      markedNumbers,
    };

    const updatedPlayers = gameState.room.players.map(player =>
      player.id === gameState.player?.id ? updatedPlayer : player
    );

    const updatedRoom = {
      ...gameState.room,
      players: updatedPlayers,
    };

    setGameState({
      ...gameState,
      room: updatedRoom,
      player: updatedPlayer,
    });

    // Broadcast room update to other players
    // In a real implementation, this would happen through Supabase Realtime
  };

  // Call the next number (host only)
  const callNextNumber = () => {
    if (!gameState.room || !gameState.player?.isHost) return;
    if (gameState.room.status !== 'playing') return;

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
