import { LoToCardType } from './types';

/**
 * Card templates for traditional Vietnamese Lô Tô game
 * Each template follows the authentic Vietnamese Lô Tô rules:
 * - 45 numbers arranged in 9 rows of 5 numbers each (with 4 blank cells per row)
 * - Numbers range from 1-90
 * - Numbers are organized by columns:
 *   - Column 1: 1-9
 *   - Column 2: 10-19
 *   - Column 3: 20-29
 *   - Column 4: 30-39
 *   - Column 5: 40-49
 *   - Column 6: 50-59
 *   - Column 7: 60-69
 *   - Column 8: 70-79
 *   - Column 9: 80-90
 * - Each column must have at least one number in each card
 * - Each card has a unique set of numbers
 */

// Template Pair 1
const template1A: LoToCardType = {
  id: 'template-1A',
  backgroundColor: '#1e5ee8', // Dark blue
  grid: [
    [null, 11, null, 35, null, 59, 68, null, 80],
    [null, 17, 24, null, 42, 57, null, 76, null],
    [1, null, 27, null, 48, null, null, 79, 81],
    [7, 16, null, 31, null, null, 65, 77, null],
    [null, null, 23, null, 44, 50, null, 71, 85],
    [null, 14, null, 37, 49, null, 63, null, 88],
    [3, null, 20, null, 46, null, 67, 73, null],
    [8, 12, null, 34, 45, null, null, null, 87],
    [null, 19, null, 39, null, 55, 60, null, 89],
  ],
};

const template1B: LoToCardType = {
  id: 'template-1B',
  backgroundColor: '#1e5ee8', // Dark blue
  grid: [
    [9, null, 25, 38, null, 53, null, null, 86],
    [null, 15, null, 36, null, 51, 64, null, 90],
    [2, null, 28, null, 47, null, 66, 78, null],
    [5, 10, null, null, 41, 56, null, 72, null],
    [4, null, 22, 33, null, 54, null, 74, null],
    [null, 13, 26, null, 40, null, 61, null, 82],
    [null, null, 29, 30, null, 58, 62, null, 83],
    [null, null, 21, null, 43, 52, null, 75, 84],
    [6, 18, null, 32, null, null, 69, 70, null],
  ],
};

// Template Pair 2
const template2A: LoToCardType = {
  id: 'template-2A',
  backgroundColor: '#d3c600', // Dark yellow
  grid: [
    [null, 15, 24, null, 44, null, 64, 79, null],
    [4, null, 29, 30, null, 51, null, 76, null],
    [null, 17, null, 32, null, 53, 63, null, 80],
    [7, null, 23, null, null, 56, 61, null, 85],
    [null, 11, null, 34, 42, null, null, 72, 87],
    [3, 13, null, null, 45, 54, null, 74, null],
    [null, 16, 21, null, 43, 58, null, 78, null],
    [6, null, null, 37, 40, null, 65, null, 82],
    [2, null, 22, 39, null, null, 67, null, 83],
  ],
};

const template2B: LoToCardType = {
  id: 'template-2B',
  backgroundColor: '#d3c600', // Dark yellow
  grid: [
    [null, 14, 28, null, null, 50, null, 75, 90],
    [null, 19, null, 31, 49, null, 68, null, 81],
    [5, null, 20, null, 47, null, null, 77, 84],
    [null, 12, null, 38, null, 55, 69, null, 89],
    [1, null, null, 36, 41, null, 66, 71, null],
    [null, 18, 26, null, null, 57, null, 70, 88],
    [8, null, 25, 33, null, 52, 62, null, null],
    [9, null, null, 35, 46, null, 60, 73, null],
    [null, 10, 27, null, 48, 59, null, null, 86],
  ],
};

// Template Pair 3
const template3A: LoToCardType = {
  id: 'template-3A',
  backgroundColor: '#015c2e', // Dark green
  grid: [
    [5, null, 29, 30, null, 56, null, null, 80],
    [null, 10, null, 35, null, 54, 63, null, 81],
    [4, null, 26, null, 45, null, 61, 79, null],
    [3, 14, null, null, 43, 50, null, 71, null],
    [7, null, 23, 31, null, 52, null, 73, null],
    [null, 11, 28, null, 49, null, 69, null, 89],
    [null, null, 24, 34, null, 53, 67, null, 85],
    [null, null, 27, null, 40, 57, null, 76, 87],
    [1, 16, null, 33, null, null, 65, 78, null],
  ],
};

const template3B: LoToCardType = {
  id: 'template-3B',
  backgroundColor: '#015c2e', // Dark green
  grid: [
    [null, 19, null, 32, null, 58, 64, null, 84],
    [null, 13, 20, null, 48, 55, null, 77, null],
    [2, null, 21, null, 46, null, null, 75, 82],
    [6, 18, null, 39, null, null, 62, 70, null],
    [null, null, 25, null, 41, 59, null, 74, 83],
    [null, 17, null, 38, 44, null, 60, null, 86],
    [8, null, 22, null, 47, null, 66, 72, null],
    [9, 12, null, 37, 42, null, null, null, 88],
    [null, 15, null, 36, null, 51, 68, null, 90],
  ],
};

// Template Pair 4
const template4A: LoToCardType = {
  id: 'template-4A',
  backgroundColor: '#bb5b1d', // Dark orange
  grid: [
    [null, 18, 22, null, null, 55, null, 76, 87],
    [null, 12, null, 38, 40, null, 66, null, 82],
    [1, null, 27, null, 42, null, null, 73, 85],
    [null, 10, null, 34, null, 56, 63, null, 80],
    [6, null, null, 35, 43, null, 64, 71, null],
    [null, 13, 21, null, null, 54, null, 74, 90],
    [7, null, 24, 32, null, 53, 67, null, null],
    [2, null, null, 36, 47, null, 65, 72, null],
    [null, 11, 23, null, 45, 51, null, null, 81],
  ],
};

const template4B: LoToCardType = {
  id: 'template-4B',
  backgroundColor: '#bb5b1d', // Dark orange
  grid: [
    [null, 19, 28, null, 46, null, 68, 75, null],
    [5, null, 26, 39, null, 58, null, 78, null],
    [null, 14, null, 37, null, 50, 69, null, 84],
    [3, null, 25, null, null, 57, 60, null, 86],
    [null, 16, null, 31, 49, null, null, 77, 89],
    [8, 17, null, null, 48, 59, null, 79, null],
    [null, 15, 20, null, 44, 52, null, 70, null],
    [4, null, null, 33, 41, null, 61, null, 83],
    [9, null, 29, 30, null, null, 62, null, 88],
  ],
};

// Template Pair 5
const template5A: LoToCardType = {
  id: 'template-5A',
  backgroundColor: '#962136', // Dark magenta
  grid: [
    [null, 12, null, 34, 40, null, null, 75, null],
    [8, 16, null, null, 42, 55, null, 77, 89],
    [5, null, 24, 33, null, null, 67, null, 83],
    [null, 14, 27, null, null, 51, null, 78, 84],
    [null, 18, null, 38, 46, null, 63, null, 81],
    [9, null, null, null, 47, null, 66, 79, 86],
    [4, null, 28, 31, null, 57, null, 72, null],
    [null, 17, null, 36, null, 52, 64, null, 80],
    [null, 19, 23, null, 45, null, 62, 74, null],
  ],
};

const template5B: LoToCardType = {
  id: 'template-5B',
  backgroundColor: '#962136', // Dark magenta
  grid: [
    [3, 15, null, 32, null, null, 60, 71, null],
    [null, 10, 20, null, 43, 54, null, null, 85],
    [2, null, 26, 35, null, 59, null, 76, null],
    [6, null, null, 39, 49, null, 68, 73, null],
    [null, 13, 29, null, 48, 50, null, null, 88],
    [null, null, 22, 30, null, 53, 65, null, 82],
    [1, null, 25, null, null, 58, 69, null, 90],
    [7, null, 21, null, 41, 56, null, null, 87],
    [null, 11, null, 37, 44, null, 61, 70, null],
  ],
};

// Template Pair 6
const template6A: LoToCardType = {
  id: 'template-6A',
  backgroundColor: '#5e3d26', // Dark brown
  grid: [
    [9, 16, null, null, 46, null, 65, null, 80],
    [null, 11, null, 32, 45, null, 68, 78, null],
    [8, null, 21, 33, null, 57, null, 73, null],
    [6, null, 20, null, 43, null, 63, 77, null],
    [null, 12, null, 31, null, 54, 62, null, 85],
    [null, 19, null, 39, 40, null, null, 70, 82],
    [null, 18, 29, null, null, 58, null, 74, 90],
    [null, 17, null, 38, 44, null, 69, null, 88],
    [2, null, 27, 37, null, 55, 67, null, null],
  ],
};

const template6B: LoToCardType = {
  id: 'template-6B',
  backgroundColor: '#5e3d26', // Dark brown
  grid: [
    [null, 13, 22, null, 41, null, 61, null, 86],
    [3, null, 24, 34, null, 52, null, 71, null],
    [1, null, null, 35, null, 56, 64, null, 83],
    [7, null, 23, 36, null, 53, null, 75, null],
    [5, null, null, null, 48, 59, null, 72, 84],
    [null, 14, 28, null, 42, null, 60, null, 87],
    [null, null, 26, null, 47, 50, null, 79, 89],
    [4, 10, null, 30, 49, null, 66, null, null],
    [null, 15, 25, null, null, 51, null, 76, 81],
  ],
};

// Template Pair 7
const template7A: LoToCardType = {
  id: 'template-7A',
  backgroundColor: '#3e3466', // Dark purple
  grid: [
    [6, 18, null, null, 47, null, 69, null, 86],
    [null, 13, null, 31, 44, null, 61, 70, null],
    [7, null, 24, 34, null, 56, null, 71, null],
    [5, null, 23, null, 41, null, 65, 74, null],
    [null, 10, null, 37, null, 53, 60, null, 89],
    [null, 17, null, 38, 42, null, null, 75, 84],
    [null, 15, 25, null, null, 51, null, 77, 85],
    [null, 12, null, 36, 43, null, 64, null, 82],
    [3, null, 26, 39, null, 58, 66, null, null],
  ],
};

const template7B: LoToCardType = {
  id: 'template-7B',
  backgroundColor: '#3e3466', // Dark purple
  grid: [
    [null, 16, 28, null, 45, null, 68, null, 87],
    [4, null, 29, 35, null, 55, null, 73, null],
    [9, null, null, 30, null, 54, 62, null, 88],
    [1, null, 21, 33, null, 52, null, 76, null],
    [8, null, null, null, 40, 50, null, 79, 81],
    [null, 11, 20, null, 46, null, 63, null, 83],
    [null, null, 27, null, 49, 59, null, 72, 80],
    [2, 19, null, 32, 48, null, 67, null, null],
    [null, 14, 22, null, null, 57, null, 78, 90],
  ],
};

// Template Pair 8
const template8A: LoToCardType = {
  id: 'template-8A',
  backgroundColor: '#9f4577', // Mulberry
  grid: [
    [null, 19, null, 35, 49, null, null, 71, 88],
    [8, 14, null, null, 47, 54, null, 74, null],
    [6, null, 25, 36, null, null, 62, null, 84],
    [null, 15, 22, null, null, 58, null, 70, 89],
    [null, 12, null, 31, 43, null, 68, null, 90],
    [1, null, null, null, 42, null, 65, 72, 87],
    [5, null, 21, 38, null, 52, null, 76, null],
    [null, 13, null, 33, null, 57, 67, null, 82],
    [null, 11, 26, null, 44, null, 69, 79, null],
  ],
};

const template8B: LoToCardType = {
  id: 'template-8B',
  backgroundColor: '#9f4577', // Mulberry
  grid: [
    [7, 16, null, 32, null, null, 66, 73, null],
    [null, 18, 29, null, 46, 55, null, null, 88],
    [2, null, 23, 34, null, 50, null, 75, null],
    [4, null, null, 30, 40, null, 61, 78, null],
    [null, 10, 27, null, 41, 56, null, null, 86],
    [null, null, 20, 39, null, 59, 60, null, 83],
    [9, null, 24, null, null, 51, 64, null, 81],
    [3, null, 28, null, 48, 53, null, null, 80],
    [null, 17, null, 37, 45, null, 63, 77, null],
  ],
};

// Template Pair 9
const template9A: LoToCardType = {
  id: 'template-9A',
  backgroundColor: '#499ae9', // Light blue
  grid: [
    [null, 15, 28, null, 44, 55, null, null, 87],
    [4, null, 29, 34, null, null, 61, 70, null],
    [null, 11, null, null, 49, 53, null, 79, 83],
    [5, null, 20, null, 48, null, 62, 75, null],
    [null, 14, null, 37, 40, null, 63, null, 90],
    [null, 19, null, 33, null, 56, null, 72, 89],
    [2, null, 26, null, 41, null, 65, null, 88],
    [null, 17, null, 32, null, 52, 69, null, 84],
    [1, null, 21, 36, null, 57, null, 73, null],
  ],
};

const template9B: LoToCardType = {
  id: 'template-9B',
  backgroundColor: '#499ae9', // Light blue
  grid: [
    [null, 16, 21, null, 44, 59, null, 81, null],
    [2, null, null, 31, 45, 54, 71, null, 78],
    [null, 11, 25, null, 48, null, 61, 84, null],
    [7, null, 23, 34, null, 55, null, 87, null],
    [null, 13, null, 35, 42, 56, 63, null, 88],
    [4, null, 24, null, null, null, 69, null, 91],
    [null, 14, null, 37, null, null, 70, 86, null],
    [6, null, 38, null, 64, null, 65, null, 66],
    [null, 18, null, null, 72, 73, 74, 76, null],
  ],
};

// Template Pair 10
const template10A: LoToCardType = {
  id: 'template-10A',
  backgroundColor: '#dd5f53', // Light red
  grid: [
    [null, 13, null, 39, 45, null, 62, null, 81],
    [5, null, 29, null, 40, 51, null, 76, null],
    [7, null, 25, 31, null, null, 64, 74, null],
    [null, 11, 21, null, null, 50, null, 79, 86],
    [2, null, 20, null, 49, 52, null, 70, null],
    [null, 19, null, 34, null, 54, 66, null, 84],
    [1, null, 22, 30, null, 53, null, null, 85],
    [6, 16, null, null, 46, null, 67, 75, null],
    [null, 14, null, 32, 47, null, 69, null, 80],
  ],
};

const template10B: LoToCardType = {
  id: 'template-10B',
  backgroundColor: '#dd5f53', // Light red
  grid: [
    [4, null, 27, 38, null, 55, null, 72, null],
    [null, 17, null, 36, null, null, 68, 78, 89],
    [null, 12, 28, null, 43, 56, null, null, 83],
    [3, null, 24, null, 41, null, 65, 73, null],
    [null, 18, null, 35, null, 57, 60, null, 82],
    [9, null, null, 37, 42, null, 61, null, 90],
    [null, 10, null, null, 48, 58, null, 77, 87],
    [null, 15, 23, 33, null, null, 63, null, 88],
    [8, null, 26, null, 44, 59, null, 71, null],
  ],
};

// Export all templates as an array of pairs
export const cardTemplates: LoToCardType[] = [
  template1A,
  template1B,
  template2A,
  template2B,
  template3A,
  template3B,
  template4A,
  template4B,
  template5A,
  template5B,
  template6A,
  template6B,
  template7A,
  template7B,
  template8A,
  template8B,
  template9A,
  template9B,
  template10A,
  template10B,
];

/**
 * Returns a random card template from the available templates
 */
export function getRandomCardTemplate(): LoToCardType {
  const randomIndex = Math.floor(Math.random() * cardTemplates.length);

  return cardTemplates[randomIndex];
}
