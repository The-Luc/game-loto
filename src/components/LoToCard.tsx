'use client';

import { useEffect, useState } from 'react';
import { useGameStore, GameState } from '@/stores/useGameStore';
import { cardTemplates } from '../lib/card-template';
import { VictoryScreen } from './VictoryScreen';
// TODO: Implement later
// import { selectCardAction } from '@/server/actions/player';
// import { declareWinnerAction } from '@/server/actions/room';

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
  const room = useGameStore((state: GameState) => state.room);
  const currentPlayer = useGameStore((state: GameState) => state.player);
  const playersInRoom = useGameStore((state: GameState) => state.playersInRoom);
  const currentCalledNumbers = useGameStore((state: GameState) => state.calledNumbers);
  const currentWinner = useGameStore((state: GameState) => state.winner);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cardSet, setCardSet] = useState<Set<number>[]>([]);

  const card = cardTemplates.find(c => c.id === cardId);
  const currentPlayerCardId = currentPlayer?.cardId;
  const selectedCardIds = playersInRoom?.map(p => p.cardId);
  const hasWon = !!currentWinner;

  useEffect(() => {
    if (!currentWinner) {
      setSelectedNumbers([]);
    }
  }, [currentWinner]);

  useEffect(() => {
    if (!card) return;
    const grid = card.grid.map(
      (row: (number | null)[]) =>
        new Set(row.filter((cell: number | null): cell is number => cell !== null))
    );
    setCardSet(grid);
  }, [card]);

  const getPlayerName = (cId: string) => {
    const player = playersInRoom?.find(p => p.cardId === cId);
    if (player?.id === currentPlayer?.id) return 'You';
    return player?.nickname || 'Unknown';
  };

  const handleCellClick = async (number: number | null) => {
    if (selectable) {
      if (!card || !currentPlayer) return;
      try {
        // await selectCardAction(currentPlayer.id, cardId);
      } catch (error) {
        console.error('Failed to select card:', error);
      }
    } else if (playable && number && !hasWon && currentPlayer && room) {
      if (!selectedNumbers.includes(number) && currentCalledNumbers.includes(number)) {
        setSelectedNumbers([...selectedNumbers, number]);

        const playerHasWon = checkWinning(number);

        if (playerHasWon) {
          try {
            // await declareWinnerAction(room.id, currentPlayer.id);
          } catch (error) {
            console.error('Failed to declare winner:', error);
          }
        }
      }
    }
  };

  const checkWinning = (number: number): boolean => {
    for (const row of cardSet) {
      if (!row.has(number)) continue;
      row.delete(number);
      if (row.size === 0) {
        return true;
      }
      break;
    }
    return false;
  };

  return (
    <>
      {hasWon && <VictoryScreen />}

      <div
        className={`border-2 rounded-lg p-2 relative bg-black/80 ${
          selectable ? 'cursor-pointer hover:border-blue-500' : ''
        } ${currentPlayerCardId === cardId && selectable ? 'border-blue-500' : ''}`}
        style={{ pointerEvents: hasWon && !selectable ? 'none' : 'auto' }}
      >
        <div className="flex flex-col">
          {[0, 1, 2].map(groupIndex => (
            <div
              key={`group-${groupIndex}`}
              className={`grid grid-cols-9 gap-[2px] ${groupIndex < 2 ? 'mb-2' : ''}`}
            >
              {card?.grid
                .slice(groupIndex * 3, groupIndex * 3 + 3)
                .map((row: (number | null)[], rowIndexInGroup: number) =>
                  row.map((cell: number | null, colIndex: number) => {
                    const rowIndex = groupIndex * 3 + rowIndexInGroup;
                    const isCalled = cell !== null && currentCalledNumbers.includes(cell);
                    const isSelected = cell !== null && selectedNumbers.includes(cell);

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
                            isSelected && isCalled
                              ? 'bg-green-300! border-green-600! border-2!'
                              : ''
                          }
                          ${!isSelected && isCalled ? 'opacity-50' : ''}
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
        {selectable &&
          selectedCardIds?.includes(cardId) &&
          currentPlayerCardId !== cardId && (
            <>
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
