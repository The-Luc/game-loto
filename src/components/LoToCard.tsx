'use client';

import { GameState, useGameStore } from '@/stores/useGameStore';
import { useEffect, useState } from 'react';
import { LoToCardType } from '../lib/types';
import { cn } from '../lib/utils';
import { markNumberAction } from '@/server/actions/room';
import { toast } from 'sonner';
import { useCurPlayer } from '../hooks/useCurPlayer';
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
  const playersInRoom = useGameStore((state: GameState) => state.playersInRoom);
  const currentPlayer = useCurPlayer();
  const currentCalledNumbers = useGameStore(
    (state: GameState) => state.calledNumbers
  );
  const currentWinner = useGameStore((state: GameState) => state.winner);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cardSet, setCardSet] = useState<Set<number>[]>([]);

  const currentPlayerCardIds = currentPlayer?.selectedCardIds || [];
  const hasWon = !!currentWinner;

  // Reset selected numbers when game ends
  useEffect(() => {
    if (!currentWinner) {
      setSelectedNumbers([]);
    }
  }, [currentWinner]);

  // Initialize marked numbers from player state if available
  useEffect(() => {
    if (
      currentPlayer?.markedNumbers &&
      currentPlayer.markedNumbers.length > 0
    ) {
      setSelectedNumbers(currentPlayer.markedNumbers);
    }
  }, [currentPlayer?.markedNumbers]);

  // Setup card grid data structure for win checking
  useEffect(() => {
    if (!card) return;
    const grid = card.grid.map(
      (row: (number | null)[]) =>
        new Set(
          row.filter((cell: number | null): cell is number => cell !== null)
        )
    );
    setCardSet(grid);
  }, [card]);

  const handleCellClick = async (number: number | null) => {
    // Only proceed if the game is playable, the number is valid, no winner yet, and we have player and room data
    if (playable && number && !hasWon && currentPlayer && room) {
      // Only allow marking numbers that have been called but haven't been marked already
      if (
        !selectedNumbers.includes(number) &&
        currentCalledNumbers.includes(number)
      ) {
        try {
          // Optimistically update the UI
          setSelectedNumbers([...selectedNumbers, number]);

          // Call the server action to mark the number
          const response = await markNumberAction(
            room.id,
            currentPlayer.id,
            card.id,
            number
          );

          if (!response.success) {
            // Revert optimistic update if server action fails
            setSelectedNumbers(selectedNumbers);
            toast.error(response.error || 'Failed to mark number');
            return;
          }

          // Check if this number completes a row
          const playerHasWon = checkWinning(number);

          if (playerHasWon) {
            try {
              // Will implement in Task 6.4
              // await declareWinnerAction(room.id, currentPlayer.id, card.id);
              toast.success('You completed a row! 🎉');
            } catch (error) {
              console.error('Failed to declare winner:', error);
              toast.error('Error detecting win');
            }
          }
        } catch (error) {
          console.error('Failed to mark number:', error);
          toast.error('Failed to mark number');
          // Revert optimistic update on error
          setSelectedNumbers(selectedNumbers);
        }
      }
    }
  };

  // Check if a number completes a row and thus the player wins
  const checkWinning = (number: number): boolean => {
    // Create a temporary copy of the card sets to avoid mutating the original state
    const tempCardSet = cardSet.map((row) => new Set([...row]));

    // Find which row the number belongs to
    for (let i = 0; i < tempCardSet.length; i++) {
      const row = tempCardSet[i];
      if (!row.has(number)) continue;

      // Remove the marked number from the set
      row.delete(number);

      // If the row is now empty (all numbers marked), player has won
      if (row.size === 0) {
        return true;
      }
      break;
    }
    return false;
  };

  return (
    <div>
      <div
        className={cn(
          'border-2 rounded-lg p-2 relative bg-black/80',
          selectable && 'cursor-pointer hover:border-blue-500',
          currentPlayerCardIds.includes(card.id) &&
            selectable &&
            'border-blue-500',
          isShaking && 'animate-shake'
        )}
        style={{ pointerEvents: !selectable ? 'none' : 'auto' }}
      >
        <div className="flex flex-col">
          {[0, 1, 2].map((groupIndex) => (
            <div
              key={`group-${groupIndex}`}
              className={`grid grid-cols-9 gap-[2px] ${groupIndex < 2 ? 'mb-[3%]' : ''}`}
            >
              {card?.grid
                .slice(groupIndex * 3, groupIndex * 3 + 3)
                .map((row: (number | null)[], rowIndexInGroup: number) =>
                  row.map((cell: number | null, colIndex: number) => {
                    const rowIndex = groupIndex * 3 + rowIndexInGroup;
                    const isCalled =
                      cell !== null && currentCalledNumbers.includes(cell);
                    const isSelected =
                      cell !== null && selectedNumbers.includes(cell);

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(cell)}
                        style={{
                          backgroundColor: cell
                            ? '#E5E7EB'
                            : card?.backgroundColor,
                        }}
                        className={cn(
                          'aspect-3/3 flex items-center justify-center text-[10%] font-bold font-oswald transition-all duration-200',
                          // Cursor feedback for interactive cells
                          playable &&
                            cell &&
                            currentCalledNumbers.includes(cell) &&
                            'cursor-pointer hover:opacity-80',
                          playable &&
                            cell &&
                            !currentCalledNumbers.includes(cell) &&
                            'cursor-not-allowed',

                          // Styling for marked cells
                          isSelected &&
                            isCalled &&
                            'bg-green-200 border-green-600 border-2 shadow-inner',

                          // Styling for called but unmarked cells
                          !isSelected && isCalled && 'opacity-70 bg-yellow-50',

                          // Highlight cells that can be marked (called but not yet marked)
                          playable &&
                            cell &&
                            !isSelected &&
                            isCalled &&
                            'ring-2 ring-yellow-400 ring-opacity-50'
                        )}
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
