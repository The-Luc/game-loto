"use client";

import { useGame } from '@/context/GameContext';
import { LoToCard } from '@/components/LoToCard';

export function CardSelection() {
  const { gameState } = useGame();
  const { availableCards } = gameState;
  
  if (!availableCards || availableCards.length === 0) return null;
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select Your Card</h2>
      <p className="mb-4">Choose one of the following cards to play with:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableCards.map((card) => (
          <div key={card.id} className="mb-4">
            <LoToCard card={card} selectable={true} />
          </div>
        ))}
      </div>
    </div>
  );
}
