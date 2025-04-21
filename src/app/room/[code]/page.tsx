'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room as RoomComponent } from '@/components/Room';
import { useGameStore } from '@/stores/useGameStore';
import { useCurPlayer } from '@/hooks/useCurPlayer';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { room } = useGameStore();
  const curPlayer = useCurPlayer();
  const roomCode = params.code as string;

  useEffect(() => {
    if (!curPlayer) {
      console.log('No player data found in store, redirecting to home.');
      router.push('/');
    }
  }, [curPlayer, router, roomCode, room]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading room data...</p>
      </div>
    );
  }

  if (room.code !== roomCode) {
    console.log(
      `Room code mismatch: URL (${roomCode}) vs Store (${room.code}). Redirecting.`
    );
    router.push('/');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Redirecting...</p>
      </div>
    );
  }

  return <RoomComponent />;
}
