/**
 * Win detection utilities for the LoTo game
 */

interface CheckWinParams {
  grid: (number | null)[][];
  markedNumbers: number[];
  lastMarkedNumber: number;
}

/**
 * Checks if a row is complete (horizontal win)
 * @param params Object containing grid, marked numbers, and last marked number
 * @returns Object indicating win status and winning pattern
 */
export function checkHorizontalWin({
  grid,
  markedNumbers,
  lastMarkedNumber,
}: CheckWinParams): {
  hasWon: boolean;
  winningRow?: number;
  winningNumbers?: number[];
} {
  // Default return value
  const result = {
    hasWon: false,
    winningRow: undefined,
    winningNumbers: undefined,
  };

  // Find which row the last marked number belongs to
  let rowIndex = -1;
  let columnIndex = -1;

  // Find the row/column indices of the last marked number
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === lastMarkedNumber) {
        rowIndex = r;
        columnIndex = c;
        break;
      }
    }
    if (rowIndex !== -1) break;
  }

  // If the number wasn't found in the grid, return no win
  if (rowIndex === -1) return result;

  // Extract the row values (ignore nulls)
  const rowValues: number[] = [];
  for (let c = 0; c < grid[rowIndex].length; c++) {
    const value = grid[rowIndex][c];
    if (value !== null) {
      rowValues.push(value);
    }
  }

  // Count marked numbers in this row
  const markedInRow = rowValues.filter((num) => markedNumbers.includes(num));

  // Win condition: all non-null values in the row are marked
  if (markedInRow.length === rowValues.length && rowValues.length > 0) {
    return {
      hasWon: true,
      winningRow: rowIndex,
      winningNumbers: rowValues,
    };
  }

  return result;
}
