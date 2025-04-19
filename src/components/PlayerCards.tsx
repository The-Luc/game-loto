'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { cardTemplates } from '@/lib/card-template';
import { LoToCardType } from '@/lib/types';
import { LoToCard } from './LoToCard';
import { RoomStatus } from '@prisma/client';

/**
 * Component to display the current player's selected cards during gameplay
 */
export function PlayerCards() {
  const { player, room, calledNumbers } = useGameStore();
  const [playerCards, setPlayerCards] = useState<LoToCardType[]>([]);

  // Only show during gameplay
  const isPlaying = room?.status === RoomStatus.playing;
  
  // Load the player's selected cards whenever they change
  useEffect(() => {
    if (player?.selectedCardIds && player.selectedCardIds.length > 0) {
      // Find the card templates that match the selected card IDs
      const selectedCards = cardTemplates.filter(card => 
        player.selectedCardIds.includes(card.id)
      );
      setPlayerCards(selectedCards);
    } else {
      setPlayerCards([]);
    }
  }, [player?.selectedCardIds]);

  // Don't render if not playing or no player/room
  if (!isPlaying || !player || !room) return null;
  
  // Don't render if no cards selected
  if (playerCards.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center mt-4">
        <p className="text-yellow-700">Bạn chưa chọn bảng nào. Hãy tham gia lại phòng để chọn bảng.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Bảng của bạn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playerCards.map(card => (
          <div key={card.id} className="bg-white p-3 rounded-lg shadow-md">
            <LoToCard 
              card={card}
              playable={true}
              selectable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
