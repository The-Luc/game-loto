'use client';
import { LoToCardType } from '../lib/types';
import { LoToCard } from './LoToCard';

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
export const SelectableCard = ({
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
