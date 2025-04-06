"use client";

import { useState } from 'react';
import { LoToCard as LoToCardType } from '@/types';
import { useGame } from '@/context/GameContext';

interface LoToCardProps {
  card: LoToCardType;
  selectable?: boolean;
  playable?: boolean;
}

export function LoToCard({ card, selectable = false, playable = false }: LoToCardProps) {
  const { gameState, selectCard, markNumber } = useGame();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  const handleCellClick = (number: number | null) => {
    if (!number) return; // Can't mark empty cells
    
    if (selectable) {
      // In selection mode, clicking selects the entire card
      selectCard(card);
    } else if (playable) {
      // In play mode, clicking marks individual numbers
      if (!selectedNumbers.includes(number)) {
        setSelectedNumbers([...selectedNumbers, number]);
        markNumber(number);
      }
    }
  };
  
  // Check if a number has been called in the game
  const isNumberCalled = (number: number | null) => {
    if (!number || !gameState.room?.calledNumbers) return false;
    return gameState.room.calledNumbers.includes(number);
  };
  
  return (
    <div className={`border-2 rounded-lg p-2 ${selectable ? 'cursor-pointer hover:border-blue-500' : ''}`}>
      <div className="grid grid-cols-8 gap-1">
        {card.grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(cell)}
              className={`
                aspect-square flex items-center justify-center text-lg font-bold rounded
                ${!cell ? 'bg-gray-200' : 'bg-white border'}
                ${playable && cell && isNumberCalled(cell) ? 'cursor-pointer hover:bg-blue-100' : ''}
                ${playable && selectedNumbers.includes(cell || 0) ? 'bg-green-200 border-green-500' : ''}
              `}
            >
              {cell || ''}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
