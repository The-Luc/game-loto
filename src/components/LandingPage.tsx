'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LandingPage() {
  const router = useRouter();
  const { nickname, setNickname, createRoom, joinRoom } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!nickname) {
      setError('Please enter a nickname');
      return;
    }

    try {
      const code = await createRoom();
      if (!code) return;

      router.push(`/room/${code}`);
    } catch {
      setError('Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    if (!nickname) {
      setError('Please enter a nickname');
      return;
    }

    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    try {
      const success = await joinRoom(roomCode, nickname);
      if (success) {
        router.push(`/room/${roomCode}`);
      } else {
        setError('Room not found');
      }
    } catch {
      setError('Failed to join room');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Lô Tô Game</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="nickname">
            Your Nickname
          </label>
          <Input
            id="nickname"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
        </div>

        {isJoining ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="roomCode">
                Room Code
              </label>
              <Input
                id="roomCode"
                placeholder="Enter 6-digit room code"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <Button onClick={handleJoinRoom}>Join Room</Button>

              <Button variant="outline" onClick={() => setIsJoining(false)}>
                Back
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-4">
            <Button onClick={handleCreateRoom}>Create New Room</Button>

            <Button variant="outline" onClick={() => setIsJoining(true)}>
              Join Existing Room
            </Button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
