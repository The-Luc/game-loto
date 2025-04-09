import { LoToCard } from '../types';

/**
 * Generates a random 6-character alphanumeric room code
 */
export function generateRoomCode(): string {
  // simple version: return random number from 1 to 100

  return Math.floor(Math.random() * 100).toString();


  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generates a random Lô Tô card with 9 rows and 8 columns
 * Each row has 5 numbers and 3 blank cells
 * Numbers range from 1-90 with no duplicates on a card
 */
export function generateLoToCard(): LoToCard {
  // Create a grid with 9 rows and 8 columns, all null initially
  const grid: (number | null)[][] = Array(9).fill(null).map(() => Array(8).fill(null));

  // Create a pool of available numbers (1-90)
  const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // For each row, randomly select 5 positions to fill with numbers
  for (let row = 0; row < 9; row++) {
    // Generate positions for the 5 numbers in this row (out of 8 positions)
    const positions = getRandomPositions(8, 5);

    for (const pos of positions) {
      // Get a random number from the pool
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const number = availableNumbers[randomIndex];

      // Remove the number from the pool
      availableNumbers.splice(randomIndex, 1);

      // Place the number in the grid
      grid[row][pos] = number;
    }
  }

  return {
    id: Math.random().toString(36).substring(2, 15),
    grid
  };
}

/**
 * Generates multiple random Lô Tô cards
 */
import { getRandomCardTemplate } from './card-template';

export function generateMultipleCards(count: number): LoToCard[] {
  const cards: LoToCard[] = [];
  for (let i = 0; i < count; i++) {
    cards.push(getRandomCardTemplate());
  }
  return cards;
}

/**
 * Helper function to get random positions in an array
 */
function getRandomPositions(max: number, count: number): number[] {
  const positions: number[] = [];
  const allPositions = Array.from({ length: max }, (_, i) => i);

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allPositions.length);
    positions.push(allPositions[randomIndex]);
    allPositions.splice(randomIndex, 1);
  }

  return positions;
}

/**
 * Reads a number in Vietnamese
 */
export function readNumberInVietnamese(number: number): void {
  if (!window.speechSynthesis) return;

  const numberText = getVietnameseNumberText(number);
  const utterance = new SpeechSynthesisUtterance(numberText);
  utterance.lang = 'vi-VN';
  window.speechSynthesis.speak(utterance);
}

/**
 * Converts a number to Vietnamese text
 */
function getVietnameseNumberText(number: number): string {
  // Simple implementation - in a real app, this would be more comprehensive
  return `Số ${number}`;
}
