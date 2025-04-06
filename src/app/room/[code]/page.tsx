"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room } from '@/components/Room';
import { useGame } from '@/context/GameContext';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { gameState, nickname, joinRoom } = useGame();
  const roomCode = params.code as string;
  
  // If no nickname is set, redirect to home page
  useEffect(() => {
    if (!nickname) {
      router.push('/');
    }
  }, [nickname, router]);
  
  // If not in a room and we have a room code, try to join it
  useEffect(() => {
    const attemptJoinRoom = async () => {
      if (!gameState.room && roomCode && nickname) {
        const success = await joinRoom(roomCode);
        if (!success) {
          // Room not found, redirect to home page
          router.push('/');
        }
      }
    };
    
    attemptJoinRoom();
  }, [gameState.room, roomCode, nickname, joinRoom, router]);
  
  // If no room in state, show loading
  if (!gameState.room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading room...</p>
      </div>
    );
  }
  
  return <Room />;
}
