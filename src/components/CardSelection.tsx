'use client';

import { LoToCard } from '@/components/LoToCard';
import { cardTemplates } from '../lib/card-template';

export function CardSelection() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select Your Card</h2>
      <p className="mb-4">Choose one of the following cards to play with:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardTemplates.map(card => (
          <div key={card.id} className="mb-4">
            <LoToCard cardId={card.id} selectable={true} />
          </div>
        ))}
      </div>
    </div>
  );
}
