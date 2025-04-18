'use client';

import { GameState, useGameStore } from '@/stores/useGameStore';
import { useState } from 'react';
import { LoToCardType } from '../lib/types';
import { cn } from '../lib/utils';
// TODO: Implement later
// import { declareWinnerAction } from '@/server/actions/room';

interface LoToCardProps {
  card: LoToCardType;
  isSelected?: boolean;
  isSelectedByOther?: boolean;
  selectable?: boolean;
  playable?: boolean;
  isShaking?: boolean;
  onClick?: () => void;
}

export function LoToCard({
  playable = false,
  card,
  isSelected,
  isSelectedByOther,
  selectable = true,
  onClick,
  isShaking,
}: LoToCardProps) {
  const room = useGameStore((state: GameState) => state.room);
  const currentPlayer = useGameStore((state: GameState) => state.player);
  const playersInRoom = useGameStore((state: GameState) => state.playersInRoom);
  const currentCalledNumbers = useGameStore((state: GameState) => state.calledNumbers);
  const currentWinner = useGameStore((state: GameState) => state.winner);
  const setPlayer = useGameStore((state: GameState) => state.setPlayer);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cardSet, setCardSet] = useState<Set<number>[]>([]);

  const currentPlayerCardIds = currentPlayer?.selectedCardIds || [];
  // const selectedCardIds = playersInRoom?.map(p => p.cardId);
  // const hasWon = !!currentWinner;

  // useEffect(() => {
  //   if (!currentWinner) {
  //     setSelectedNumbers([]);
  //   }
  // }, [currentWinner]);

  // useEffect(() => {
  //   if (!card) return;
  //   const grid = card.grid.map(
  //     (row: (number | null)[]) =>
  //       new Set(row.filter((cell: number | null): cell is number => cell !== null))
  //   );
  //   setCardSet(grid);
  // }, [card]);


  const handleSelectCard = async () => {
    // This code interferes with the new implementation in CardSelection.tsx
    return;
    // if (!card || !currentPlayer || !selectable) return;
    // try {
    //   setPlayer({ ...currentPlayer, cardId: cardId });
    //   const response = await selectCardAction(currentPlayer.id, cardId);
    //   if (!response.success) {
    //     showErrorToast(response.error || 'Lỗi chọn thẻ');
    //   }
    // } catch (error) {
    //   console.error('Failed to select card:', error);
    // }
  };

  const handleCellClick = async (number: number | null) => {
    if (selectable) {
      return handleSelectCard();
    }

    // if (playable && number && !hasWon && currentPlayer && room) {
    //   if (!selectedNumbers.includes(number) && currentCalledNumbers.includes(number)) {
    //     setSelectedNumbers([...selectedNumbers, number]);

        // const playerHasWon = checkWinning(number);

        // if (playerHasWon) {
        //   try {
        //     // await declareWinnerAction(room.id, currentPlayer.id);
        //   } catch (error) {
        //     console.error('Failed to declare winner:', error);
        //   }
        // }
      // }
    // }
  };

  // const checkWinning = (number: number): boolean => {
  //   for (const row of cardSet) {
  //     if (!row.has(number)) continue;
  //     row.delete(number);
  //     if (row.size === 0) {
  //       return true;
  //     }
  //     break;
  //   }
  //   return false;
  // };

  return (
    <div>
      <div
        onClick={handleSelectCard}
        className={cn(
          "border-2 rounded-lg p-2 relative bg-black/80",
          selectable && "cursor-pointer hover:border-blue-500",
          currentPlayerCardIds.includes(card.id) && selectable && "border-blue-500",
          isShaking && "animate-shake"
        )}
        style={{ pointerEvents: !selectable ? 'none' : 'auto' }}
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
      </div>
    </div>
  );
}
