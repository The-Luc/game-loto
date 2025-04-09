'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { cardTemplates } from '../lib/card-template';
import { VictoryScreen } from './VictoryScreen';

interface LoToCardProps {
  cardId: string;
  selectable?: boolean;
  playable?: boolean;
}

export function LoToCard({
  cardId,
  selectable = false,
  playable = false,
}: LoToCardProps) {
  const { gameState, selectCard } = useGame();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cardSet, setCardSet] = useState<Set<number>[]>([]);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState<boolean>(false);

  const card = cardTemplates.find(card => card.id === cardId);
  const player = gameState.player;
  const currPlayerCardId = player?.cardId;
  const players = gameState.room?.players;
  const selectedCardIds = players?.map(p => p.cardId);
  const calledNumbers = gameState.room?.calledNumbers || [];

  useEffect(() => {
    if (!card) return;
    const grid = card.grid.map(row => new Set(row.filter(cell => cell !== null)));
    setCardSet(grid);
  }, [card]);

  const getPlayerName = (cardId: string) => {
    const player = players?.find(p => p.cardId === cardId);
    if (player?.id === gameState.player?.id) return 'You';
    return player?.nickname || 'Unknown';
  };

  const handleCellClick = async (number: number | null) => {
    if (selectable) {
      // In selection mode, clicking selects the entire card
      if (!card) return;
      await selectCard(cardId);
    } else if (playable && number && !hasWon) {
      // In play mode, clicking marks individual numbers
      if (!selectedNumbers.includes(number) && calledNumbers.includes(number)) {
        setSelectedNumbers([...selectedNumbers, number]);
        const hasWon = checkWinning(number);

        if (hasWon) {
          // player has won
          setHasWon(true);
          setShowVictoryScreen(true);
        }
      }
    }
  };

  // Check if the player has won, if they have a row of 5 numbers
  const checkWinning = (number: number) => {
    // find the item in the set and remove it
    for (const row of cardSet) {
      if (!row.has(number)) continue;
      row.delete(number);

      // check if the row is empty
      if (row.size === 0) {
        // player has won
        return true;
      }
      break;
    }
  };

  return (
    <>
      {showVictoryScreen && (
        <VictoryScreen winner="You" onCloseAction={() => setShowVictoryScreen(false)} />
      )}
      <div
        className={`border-2 rounded-lg p-2 relative bg-black/80 ${
          selectable ? 'cursor-pointer hover:border-blue-500' : ''
        } ${currPlayerCardId === cardId && selectable ? 'border-blue-500' : ''}`}
      >
        <div className="flex flex-col">
          {/* Group rows in sets of 3 */}
          {[0, 1, 2].map(groupIndex => (
            <div
              key={`group-${groupIndex}`}
              className={`grid grid-cols-9 gap-[2px] ${groupIndex < 2 ? 'mb-2' : ''}`}
            >
              {card?.grid
                .slice(groupIndex * 3, groupIndex * 3 + 3)
                .map((row, rowIndexInGroup) =>
                  row.map((cell, colIndex) => {
                    const rowIndex = groupIndex * 3 + rowIndexInGroup;
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(cell)}
                        style={{
                          backgroundColor: cell ? '#E5E7EB' : card?.backgroundColor,
                        }}
                        className={`
                      aspect-3/3 flex items-center justify-center text-[5vmin] md:text-[1.6vmin] lg:text-[2.1vmin] font-bold font-oswald
                      ${playable && cell ? 'cursor-pointer' : ''}
                      ${
                        playable && selectedNumbers.includes(cell || 0)
                          ? 'border-green-500 border-5'
                          : ''
                      }
                    `}
                      >
                        {cell || ''}
                      </div>
                    );
                  })
                )}
            </div>
          ))}
        </div>
        {selectable && selectedCardIds?.includes(cardId) && (
          <>
            {/* Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 cursor-not-allowed pointer-events-none rounded-lg"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="flex items-center justify-center h-full text-green-300 opacity-100 text-4xl font-bold ">
                {getPlayerName(cardId)}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
