'use server';

import { prisma } from '@/lib/prisma';
import { cardTemplates } from '@/lib/card-template';
import { supabaseRealtime } from '@/lib/supabase';
import { RealtimeEventEnum } from '@/lib/enums';
import { RoomStatus } from '@prisma/client';

// Define the maximum number of cards a player can select (mirroring frontend)
const MAX_NUM_CARDS = 2;

type SelectCardResponse = {
  success: boolean;
  error?: string;
  selectedCardIds?: string[]; // Updated response field
};

/**
 * Selects or deselects cards for a player.
 */
export async function selectPlayerCardsAction(
  playerId: string,
  selectedCardIds: string[] // Updated parameter
): Promise<SelectCardResponse> {
  try {
    // Validate number of selected cards
    if (selectedCardIds.length > MAX_NUM_CARDS) {
      return {
        success: false,
        error: `Bạn chỉ có thể chọn tối đa ${MAX_NUM_CARDS} thẻ.`,
      };
    }

    // Validate all card IDs if any are selected
    if (selectedCardIds.length > 0) {
      const allValid = selectedCardIds.every((id) =>
        cardTemplates.some((template) => template.id === id)
      );
      if (!allValid) {
        return {
          success: false,
          error: 'Lựa chọn thẻ không hợp lệ.',
        };
      }
    }

    // Find the player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      // Include other players in the room to check for conflicts
      include: {
        room: {
          include: { players: { select: { id: true, selectedCardIds: true } } },
        },
      },
    });

    if (!player) {
      return {
        success: false,
        error: 'Không tìm thấy người chơi',
      };
    }

    // Check if the room is in the correct state
    if (player.room.status !== RoomStatus.waiting) {
      return {
        success: false,
        error: 'Không thể chọn thẻ. Phòng đã bắt đầu.',
      };
    }

    // Check if any selected card is already selected by another player in the room
    for (const otherPlayer of player.room.players) {
      if (otherPlayer.id === playerId) continue; // Skip self

      const conflict = selectedCardIds.some((id) =>
        otherPlayer.selectedCardIds.includes(id)
      );

      if (conflict) {
        return {
          success: false,
          error: 'Một hoặc nhiều thẻ bạn chọn đã được người chơi khác chọn.',
        };
      }
    }

    // Update the player with the selected card(s)
    await prisma.player.update({
      where: { id: playerId },
      data: { selectedCardIds }, // Update with the array
    });

    // Broadcast card selection event for real-time updates
    // TODO: Ensure CardSelectedPayload type definition matches this { playerId, selectedCardIds }
    await supabaseRealtime.broadcast(
      player.room.id,
      RealtimeEventEnum.CARD_SELECTED,
      {
        playerId,
        selectedCardIds, // Send the array
      }
    );

    return {
      success: true,
      selectedCardIds, // Return the array
    };
  } catch (error) {
    console.error('Failed to select card:', error);
    return {
      success: false,
      error: 'Failed to select card. Please try again.',
    };
  }
}
