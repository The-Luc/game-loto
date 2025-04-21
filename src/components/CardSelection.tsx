'use client';

import { useState, useEffect, useTransition } from 'react';
import { cardTemplates } from '../lib/card-template';
import { useGameStore } from '@/stores/useGameStore';
import { useCurPlayer } from '@/hooks/useCurPlayer';
import { Button } from '@/components/ui/button';
import { updateRoomStatusAction } from '@/server/actions/room';
import { selectPlayerCardsAction } from '@/server/actions/player'; // Import the new action
import { LoToCardType } from '../lib/types';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { SelectableCard } from './SelectableCard';

// Define the maximum number of cards a player can select
const MAX_NUM_CARDS = 2;

export function CardSelection() {
  const { room, playersInRoom, setRoom } = useGameStore();
  const curPlayer = useCurPlayer();
  // State to hold the IDs of the selected cards
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState<{
    cardId: string;
    key: number;
  } | null>(null); // State for shake animation
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (curPlayer) {
      // Initialize with the player's current selection from the backend
      setSelectedCardIds(curPlayer.selectedCardIds || []);
      setIsHost(curPlayer.isHost);
    }
  }, [curPlayer]);

  useEffect(() => {
    if (playersInRoom && playersInRoom.length > 0) {
      // Check if all players have selected at least one card
      const allSelected = playersInRoom.every(
        (p) => p.selectedCardIds.length > 0
      );
      setAllPlayersReady(allSelected);
    }
  }, [playersInRoom]);

  // Function to find which player selected a specific card
  const findPlayerName = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) return 'Thẻ của bạn';

    // Check which player's selectedCardIds includes the cardId
    const p = playersInRoom?.find((p) => p.selectedCardIds.includes(cardId));
    if (!p) return '';
    return p.id === curPlayer?.id ? 'Thẻ của bạn' : p.nickname || 'Không biết';
  };

  // Handler for selecting/deselecting a card
  const handleCardSelect = async (cardId: string) => {
    if (!curPlayer || isPending) return; // Prevent action if no player or already updating

    const isSelected = selectedCardIds.includes(cardId);
    let finalSelectedIds: string[] = [...selectedCardIds];

    if (isSelected) {
      // Deselect: remove the card ID
      finalSelectedIds = finalSelectedIds.filter((id) => id !== cardId);
    } else {
      finalSelectedIds.push(cardId);
    }

    if (finalSelectedIds.length > MAX_NUM_CARDS) {
      // Limit reached, trigger shake animation on the clicked card
      setShakeTrigger({ cardId: cardId, key: Date.now() }); // Use key to re-trigger
      setTimeout(() => setShakeTrigger(null), 1000);
      return;
    }

    // Optimistically update UI state
    setSelectedCardIds(finalSelectedIds);

    startTransition(async () => {
      const response = await selectPlayerCardsAction(
        curPlayer.id,
        finalSelectedIds
      );

      if (!response.success) {
        toast.error('Lỗi khi chọn bảng', { description: response.error });
        // Revert optimistic update on error
        setSelectedCardIds(curPlayer.selectedCardIds || []);
        return;
      }

      // Update successful, local state is already correct
      console.log(
        'Card selection updated successfully:',
        response.selectedCardIds
      );
    });
  };

  const startGame = async () => {
    if (!room) return;

    try {
      const response = await updateRoomStatusAction(room.id, 'playing');

      if (response.success) {
        // Update the local room state
        setRoom({
          ...room,
          status: 'playing',
        });
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          Chọn bảng của bạn
        </h2>
        <p className="text-center text-gray-600 mb-2">
          Chọn một trong những bảng sau để chơi.
        </p>
        <p className="text-center text-blue-600 font-medium mb-6">
          Đã chọn {selectedCardIds.length} / {MAX_NUM_CARDS} bảng
        </p>

        {isHost && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Bạn là chủ xị</h3>
            <p className="text-sm text-blue-600 mb-3">
              Bạn có thể bắt đầu trò chơi khi tất cả các người chơi đã chọn một
              bảng.
            </p>
            <Button
              onClick={startGame}
              disabled={!allPlayersReady}
              className="w-full sm:w-auto"
            >
              {allPlayersReady
                ? 'Bắt đầu trò chơi'
                : 'Đang chờ tất cả các người chơi chọn bảng...'}
            </Button>
          </div>
        )}

        <div className={cn('grid grid-cols-2 xl:grid-cols-3 gap-6')}>
          {cardTemplates.map((card: LoToCardType) => {
            const isSelected = selectedCardIds.includes(card.id);
            // Check if any other player has this card selected
            const isSelectedByOther =
              !isSelected &&
              playersInRoom?.some(
                (p) =>
                  p.id !== curPlayer?.id && p.selectedCardIds.includes(card.id)
              );
            const name = findPlayerName(card.id);

            return (
              <SelectableCard
                key={card.id}
                card={card}
                isSelected={isSelected}
                isSelectedByOther={!!isSelectedByOther} // Ensure boolean
                playerName={name}
                selectable={!isSelectedByOther && !isPending} // Disable click while updating
                onClick={() => handleCardSelect(card.id)}
                isShaking={
                  !!(shakeTrigger?.key && shakeTrigger.cardId === card.id)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
