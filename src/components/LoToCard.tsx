'use client';

import { GameState, useGameStore } from '@/stores/useGameStore';
import { useEffect, useState } from 'react';
import { LoToCardType } from '../lib/types';
import { cn } from '../lib/utils';
import { markNumberAction, declareWinnerAction } from '@/server/actions/room';
import { toast } from 'sonner';
import { useCurPlayer } from '../hooks/useCurPlayer';

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

          // Check if this number completes a column
          const playerHasWon = checkWinning(number);

          if (playerHasWon) {
            try {
              // Get all numbers in the winning column
              let foundColumn = -1;
              
              // Find the column of the newly marked number
              for (let r = 0; r < card.grid.length; r++) {
                for (let c = 0; c < card.grid[r].length; c++) {
                  if (card.grid[r][c] === number) {
                    foundColumn = c;
                    break;
                  }
                }
                if (foundColumn !== -1) break;
              }
              
              // Extract all numbers in this column (ignoring nulls)
              const winningNumbers: number[] = [];
              for (let r = 0; r < card.grid.length; r++) {
                const value = card.grid[r][foundColumn];
                if (value !== null) {
                  winningNumbers.push(value);
                }
              }
              
              // Call the server action to declare the winner
              const result = await declareWinnerAction(room.id, currentPlayer.id, card.id, winningNumbers);
              if (result.success) {
                toast.success('You completed a column! 🎉');
              } else {
                console.error('Failed to declare winner:', result.error);
                toast.error(result.error || 'Error declaring win');
              }
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

  // Check if a number completes a column for win detection
  const checkWinning = (number: number): boolean => {
    // We need to have at least one marked number to check for a win
    if (!number) return false;
    
    // Need to know the player's marked numbers and card grid
    if (!currentPlayer?.markedNumbers || !card.grid) return false;
    
    // Convert the 2D grid to a format we can use with our win detection
    const markedNumbers = [...selectedNumbers, number]; // Include the number just marked

    // Find the position (column/row) of the last marked number
    let foundColumn = -1;
    let foundRow = -1;
    
    // Find column and row of the newly marked number
    for (let r = 0; r < card.grid.length; r++) {
      for (let c = 0; c < card.grid[r].length; c++) {
        if (card.grid[r][c] === number) {
          foundRow = r;
          foundColumn = c;
          break;
        }
      }
      if (foundColumn !== -1) break;
    }
    
    // If we couldn't find the number in the grid
    if (foundColumn === -1) return false;
    
    // Extract all numbers in this column (ignoring nulls)
    const columnValues: number[] = [];
    for (let r = 0; r < card.grid.length; r++) {
      const value = card.grid[r][foundColumn];
      if (value !== null) {
        columnValues.push(value);
      }
    }
    
    // Check if all numbers in this column are marked
    const allValuesMarked = columnValues.every(num => markedNumbers.includes(num));
    
    return allValuesMarked;
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
