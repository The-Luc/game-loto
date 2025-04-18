'use client';

import { useState, useEffect } from 'react';
import { LoToCard } from '@/components/LoToCard';
import { cardTemplates } from '../lib/card-template';
import { useGameStore } from '@/stores/useGameStore';
import { Button } from '@/components/ui/button';
import { updateRoomStatusAction } from '@/server/actions/room';
import { selectPlayerCardsAction } from '@/server/actions/player'; // Import the new action
import { LoToCardType } from '../lib/types';
import { toast } from 'sonner';

// Card item component to separate rendering logic from the main component
type SelectableCardProps = {
  card: LoToCardType;
  isSelected: boolean;
  isSelectedByOther: boolean;
  playerName: string;
  selectable: boolean;
  onClick: () => void;
  isShaking: boolean; // Add prop for shake animation
};

const SelectableCard = ({
  card,
  isSelected,
  isSelectedByOther,
  playerName,
  selectable,
  onClick,
  isShaking,
}: SelectableCardProps) => {
  const isCardSelected = isSelected || isSelectedByOther;

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className={`
        relative rounded-lg transition-all duration-300 
        ${isSelected ? 'ring-4 ring-blue-500 scale-102' : ''}
        ${isSelectedByOther ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-102'}
        ${isShaking ? 'animate-shake' : ''}
      `}
    >
      <LoToCard card={card} selectable={selectable} />

      {isCardSelected && playerName && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50  rounded-lg">
          <div className="bg-red-400 text-white px-10 py-2 rounded-md text-lg  border-2 border-white">
            {playerName}
          </div>
        </div>
      )}
    </div>
  );
};

// Define the maximum number of cards a player can select
const MAX_NUM_CARDS = 2;

export function CardSelection() {
  const { player, room, playersInRoom, setRoom } = useGameStore();
  // State to hold the IDs of the selected cards
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState<{
    cardId: string;
    key: number;
  } | null>(null); // State for shake animation
  const [isUpdating, setIsUpdating] = useState(false); // State for loading/disabled state

  // Function to find which player selected a specific card
  const findPlayerName = (cardId: string) => {
    console.log('🚀 ~ findPlayerName ~ cardId:', cardId);
    console.log('🚀 ~ findPlayerName ~ playersInRoom:', playersInRoom);
    if (selectedCardIds.includes(cardId)) return 'Thẻ của bạn';

    // Check which player's selectedCardIds includes the cardId
    const p = playersInRoom?.find((p) => p.selectedCardIds.includes(cardId));
    if (!p) return '';
    return p.id === player?.id ? 'Thẻ của bạn' : p.nickname || 'Không biết';
  };

  useEffect(() => {
    if (player) {
      // Initialize with the player's current selection from the backend
      setSelectedCardIds(player.selectedCardIds || []);
      setIsHost(player.isHost);
    }
  }, [player]);

  useEffect(() => {
    if (playersInRoom && playersInRoom.length > 0) {
      // Check if all players have selected at least one card
      const allSelected = playersInRoom.every(
        (p) => p.selectedCardIds.length > 0
      );
      setAllPlayersReady(allSelected);
    }
  }, [playersInRoom]);

  // Handler for selecting/deselecting a card
  const handleCardSelect = async (cardId: string) => {
    if (!player || isUpdating) return; // Prevent action if no player or already updating

    // Optimistically update UI state
    let newSelectedIds: string[] = [];
    setSelectedCardIds((prevSelectedIds) => {
      const isSelected = prevSelectedIds.includes(cardId);

      if (isSelected) {
        // Deselect: remove the card ID
        return prevSelectedIds.filter((id) => id !== cardId);
      }

      // Select: add the card ID if limit not reached
      if (prevSelectedIds.length < MAX_NUM_CARDS) {
        return [...prevSelectedIds, cardId];
      }

      // Limit reached, trigger shake animation on the clicked card
      setShakeTrigger({ cardId: cardId, key: Date.now() }); // Use key to re-trigger
      setTimeout(() => setShakeTrigger(null), 1000);
      newSelectedIds = prevSelectedIds; // Keep the same array
      return newSelectedIds;
    });

    // Call server action if the selection actually changed
    // Check length because the state update might return the same array reference if limit reached
    if (
      newSelectedIds.length !== selectedCardIds.length ||
      !newSelectedIds.every((id, index) => id === selectedCardIds[index])
    ) {
      setIsUpdating(true);
      try {
        const response = await selectPlayerCardsAction(
          player.id,
          newSelectedIds
        );
        if (!response.success) {
          console.error('Failed to update card selection:', response.error);
          // TODO: Add user-facing error feedback (e.g., toast)
          toast.error('Lỗi khi chọn bảng');
          // Revert optimistic update on error
          setSelectedCardIds(player.selectedCardIds || []);
        } else {
          // Update successful, local state is already correct
          console.log(
            'Card selection updated successfully:',
            response.selectedCardIds
          );
        }
      } catch (error) {
        console.error('Error calling selectPlayerCardsAction:', error);
        // TODO: Add user-facing error feedback (e.g., toast)
        toast.error('Lỗi khi chọn bảng');
        // Revert optimistic update on error
        setSelectedCardIds(player.selectedCardIds || []);
      } finally {
        setIsUpdating(false);
      }
    }
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
    <div className="p-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          Chọn bảng của bạn
        </h2>
        <p className="text-center text-gray-600 mb-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cardTemplates.map((card: LoToCardType) => {
            const isSelected = selectedCardIds.includes(card.id);
            // Check if any other player has this card selected
            const isSelectedByOther =
              !isSelected &&
              playersInRoom?.some(
                (p) =>
                  p.id !== player?.id && p.selectedCardIds.includes(card.id)
              );
            const name = findPlayerName(card.id);

            return (
              <SelectableCard
                key={card.id}
                card={card}
                isSelected={isSelected}
                isSelectedByOther={!!isSelectedByOther} // Ensure boolean
                playerName={name}
                selectable={!isSelectedByOther && !isUpdating} // Disable click while updating
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
