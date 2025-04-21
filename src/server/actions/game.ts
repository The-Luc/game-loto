'use server';

import { prisma } from '@/lib/prisma';
import { supabaseRealtime } from '@/lib/supabase';
import { RealtimeEventEnum } from '@/lib/enums';
import { RoomStatus } from '@prisma/client';

type ResetGameResponse = {
  success: boolean;
  error?: string;
};

/**
 * Reset game state while preserving player information
 * This allows for starting a new game with the same players
 */
export async function resetGameAction(roomId: string): Promise<ResetGameResponse> {
  try {
    // Get the room to check if it exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return {
        success: false,
        error: 'Room not found',
      };
    }

    // Reset the room - clear called numbers and winner
    await prisma.room.update({
      where: { id: roomId },
      data: {
        calledNumbers: [],
        winnerId: null,
        status: RoomStatus.waiting,
      },
    });

    // Reset each player's marked numbers
    await prisma.player.updateMany({
      where: { roomId },
      data: {
        markedNumbers: [],
      },
    });

    // Broadcast game reset event
    await supabaseRealtime.broadcast(roomId, RealtimeEventEnum.GAME_RESET, {
      resetTime: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to reset game:', error);
    return {
      success: false,
      error: 'Failed to reset game. Please try again.',
    };
  }
}
