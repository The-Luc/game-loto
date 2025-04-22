'use client';

import { GameState, useGameStore } from '@/stores/useGameStore';
import { useEffect, useState } from 'react';
import { LoToCardType } from '../lib/types';
import { cn } from '../lib/utils';
import { markNumberAction, declareWinnerAction } from '@/server/actions/room';
import { toast } from 'sonner';
import { useCurPlayer } from '../hooks/useCurPlayer';
import { checkHorizontalWin } from '@/utils/winDetection';

interface LoToCardProps {
  card: LoToCardType;
  isSelected?: boolean;
  isSelectedByOther?: boolean;
  selectable?: boolean;
  playable?: boolean;
  isShaking?: boolean;
  highlightedRowIndex?: number; // New prop for highlighting a winning row
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

import { Card } from '@/components/ui/card';

export function LoToCard({
  playable = false,
  card,
  isSelected,
  isSelectedByOther,
  selectable = true,
  onClick,
  isShaking,
  highlightedRowIndex,
  className = '',
  style = {},
}: LoToCardProps) {
  const room = useGameStore((state: GameState) => state.room);
  const currentPlayer = useCurPlayer();
  const currentCalledNumbers = useGameStore((state: GameState) => state.calledNumbers);
  const currentWinner = useGameStore((state: GameState) => state.winner);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [completedColumns, setCompletedColumns] = useState<number[]>([]);

  const currentPlayerCardIds = currentPlayer?.selectedCardIds || [];
  const hasWon = !!currentWinner;

  // Reset selected numbers when game ends
  useEffect(() => {
    if (!currentWinner) {
      setSelectedNumbers([]);
      setCompletedColumns([]);
    }
  }, [currentWinner]);

  // Initialize marked numbers from player state if available
  useEffect(() => {
    if (currentPlayer?.markedNumbers && currentPlayer.markedNumbers.length > 0) {
      setSelectedNumbers(currentPlayer.markedNumbers);
      // Check for completed columns when marked numbers change
      updateCompletedColumns(currentPlayer.markedNumbers);
    }
  }, [currentPlayer?.markedNumbers]);

  // Function to check and update completed columns
  const updateCompletedColumns = (markedNumbers: number[]) => {
    if (!card?.grid) return;

    const completed: number[] = [];

    // Check each column for completion
    for (let c = 0; c < card.grid[0].length; c++) {
      // Extract all numbers in this column (ignoring nulls)
      const columnValues: number[] = [];
      for (let r = 0; r < card.grid.length; r++) {
        const value = card.grid[r][c];
        if (value !== null) {
          columnValues.push(value);
        }
      }

      // Check if all numbers in this column are marked
      const allMarked = columnValues.every((num) => markedNumbers.includes(num));

      if (allMarked && columnValues.length > 0) {
        completed.push(c);
      }
    }

    setCompletedColumns(completed);
  };

  const handleCellClick = async (number: number | null) => {
    // Only proceed if the game is playable, the number is valid, no winner yet, and we have player and room data
    if (playable && number && !hasWon && currentPlayer && room) {
      // Only allow marking numbers that have been called but haven't been marked already
      if (!selectedNumbers.includes(number) && currentCalledNumbers.includes(number)) {
        try {
          // Optimistically update the UI
          const newMarkedNumbers = [...selectedNumbers, number];
          setSelectedNumbers(newMarkedNumbers);

          // Check for completed columns with the newly marked number
          updateCompletedColumns(newMarkedNumbers);

          // Call the server action to mark the number
          const response = await markNumberAction(room.id, currentPlayer.id, card.id, number);

          if (!response.success) {
            // Revert optimistic update if server action fails
            setSelectedNumbers(selectedNumbers);
            toast.error(response.error || 'Failed to mark number');
            return;
          }

          // Check if this number completes a row
          // This now returns all necessary win info (hasWon, winningNumbers, winningRowIndex)
          const winResult = checkWinning(number);

          if (winResult.hasWon && winResult.winningNumbers && winResult.winningRowIndex !== undefined) {
            try {
              // Call the server action to declare the winner
              const result = await declareWinnerAction(
                room.id,
                currentPlayer.id,
                card.id,
                winResult.winningNumbers,
                winResult.winningRowIndex
              );

              if (result.success) {
                toast.success('You completed a row! 🎉');
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

  // Check if a number completes a row (horizontal win)
  const checkWinning = (
    number: number
  ): {
    hasWon: boolean;
    winningNumbers?: number[];
    winningRowIndex?: number;
  } => {
    // We need to have at least one marked number to check for a win
    if (!number) return { hasWon: false };

    // Need to know the player's marked numbers and card grid
    if (!currentPlayer?.markedNumbers || !card.grid) return { hasWon: false };

    // Convert the 2D grid to a format we can use with our win detection
    const markedNumbers = [...selectedNumbers, number]; // Include the number just marked

    // Check for a horizontal win (completed row)
    const horizontalWin = checkHorizontalWin({
      grid: card.grid,
      markedNumbers,
      lastMarkedNumber: number,
    });

    // Return win status and details
    if (horizontalWin.hasWon) {
      return {
        hasWon: true,
        winningNumbers: horizontalWin.winningNumbers,
        winningRowIndex: horizontalWin.winningRow,
      };
    }

    return { hasWon: false };
  };

  return (
    <Card
      className={cn(
        'border-2 rounded-lg p-1 xs:p-2 relative bg-black/80',
        selectable && 'cursor-pointer hover:border-blue-500 transition-colors',
        currentPlayerCardIds.includes(card.id) && selectable && 'border-blue-500',
        isShaking && 'animate-shake',
        'touch-manipulation',
        className
      )}
      style={{ pointerEvents: !selectable ? 'none' : 'auto', ...style }}
    >
      <div className="flex flex-col gap-1">
        {[0, 1, 2].map((groupIndex) => (
          <div
            key={`group-${groupIndex}`}
            // className={`grid grid-cols-9 gap-[1px] xs:gap-[2px] sm:gap-1 ${groupIndex < 2 ? 'mb-[1%] xs:mb-[3%]' : ''}`}
            className={`grid grid-cols-9 gap-[1px] xs:gap-[2px] sm:gap-1`}
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
                      role={playable && cell ? 'button' : 'cell'}
                      tabIndex={cell && playable ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCellClick(cell);
                          e.preventDefault();
                        }
                      }}
                      style={{
                        backgroundColor: cell ? '#E5E7EB' : card?.backgroundColor,
                      }}
                      className={cn(
                        // Base layout
                        'aspect-square flex items-center justify-center',
                        // Responsive text sizing
                        'text-[20px]  sm:text-[14px] md:text-xl lg:text-2xl font-bold font-oswald',
                        // Touch friendly interactions
                        'transition-all duration-200',
                        playable && cell && 'active:scale-95 md:hover:scale-105',
                        // Cursor feedback for interactive cells
                        playable && cell && currentCalledNumbers.includes(cell) && 'cursor-pointer hover:opacity-80',

                        // Styling for marked cells
                        isSelected && isCalled && 'bg-green-700! border-green-600 border-3 shadow-inner',

                        // Highlight completed column
                        completedColumns.includes(colIndex) &&
                          cell &&
                          'bg-green-500 border-green-700 border-3 shadow-lg',

                        // Highlight winning row
                        highlightedRowIndex !== undefined &&
                          highlightedRowIndex === rowIndex &&
                          cell &&
                          'bg-amber-300 border-amber-600 border-2 shadow-lg animate-pulse',

                        // Highlight cells that can be marked (called but not yet marked)
                        playable && cell && !isSelected && isCalled && 'ring-2 ring-yellow-400 ring-opacity-50'
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
    </Card>
  );
}
