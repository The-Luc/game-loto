'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/useGameStore';
import { createRoomAction, joinRoomAction } from '../server/actions/room';
import { useCurPlayer } from '../hooks/useCurPlayer';

export function LandingPage() {
  const router = useRouter();
  const { playersInRoom, setPlayersInRoom, setCurPlayerId, setRoom } =
    useGameStore();
  const curPlayer = useCurPlayer();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localNickname, setLocalNickname] = useState('');

  useEffect(() => {
    setLocalNickname(curPlayer?.nickname || '');
  }, [curPlayer?.nickname]);

  const handleCreateRoom = async () => {
    if (!localNickname) {
      setError('Please enter a nickname');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await createRoomAction(localNickname);

      if (response.success && response.room && response.player) {
        setRoom(response.room);
        setPlayersInRoom([response.player]);
        setCurPlayerId(response.player.id);
        router.push(`/room/${response.room.code}`);
      } else {
        setError(response.error || 'Failed to create room');
      }
    } catch (err) {
      console.error('Create room error:', err);
      setError('An unexpected error occurred while creating the room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!localNickname) {
      setError('Please enter a nickname');
      return;
    }

    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await joinRoomAction(roomCode, localNickname);

      if (response.success && response.room && response.player) {
        setRoom(response.room);
        setPlayersInRoom([...playersInRoom, response.player]);
        setCurPlayerId(response.player.id);
        router.push(`/room/${roomCode}`);
      } else {
        setError(response.error || 'Failed to join room');
      }
    } catch (err) {
      console.error('Join room error:', err);
      setError('An unexpected error occurred while joining the room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center ">Lô Tô</h1>
        <h6 className="text-sm text-center mb-6 text-gray-700">
          Cờ ra con mấy con mấy cờ ra
        </h6>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="nickname">
            Tên
          </label>
          <Input
            id="nickname"
            placeholder="Nhập tên"
            value={localNickname}
            onChange={(e) => setLocalNickname(e.target.value)}
          />
        </div>

        {isJoining ? (
          <>
            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="roomCode"
              >
                Mã Phòng
              </label>
              <Input
                id="roomCode"
                placeholder="Nhập mã phòng"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <Button onClick={handleJoinRoom} disabled={isLoading}>
                {isLoading ? 'Đang tham gia...' : 'Tham gia phòng'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsJoining(false)}
                disabled={isLoading}
              >
                Quay lại
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-4">
            <Button onClick={handleCreateRoom} disabled={isLoading}>
              {isLoading ? 'Đang tạo phòng...' : 'Tạo phòng mới'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsJoining(true)}
              disabled={isLoading}
            >
              Tham gia phòng
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
