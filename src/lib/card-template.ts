import { LoToCard } from '../types';

/**
 * Card templates for Lô Tô game
 * Each template pair (A and B) has complementary numbers and the same background color
 * Numbers are organized by columns:
 * - Column 1: 1-9
 * - Column 2: 10-19
 * - Column 3: 20-29
 * - Column 4: 30-39
 * - Column 5: 40-49
 * - Column 6: 50-59
 * - Column 7: 60-69
 * - Column 8: 70-79
 * - Column 9: 80-90
 */

// Template Pair 1
const template1A: LoToCard = {
  id: 'template-1A',
  grid: [
    [1, 14, 28, null, 50, null, 75, 90],
    [null, 19, null, 31, 49, 68, null, 81],
    [5, null, 20, null, 47, null, 77, 84],
    [null, 12, null, 38, 55, 69, null, 89],
    [null, 1, 36, 41, null, 66, 71, null],
    [18, 26, null, null, 57, null, 70, 88],
    [8, null, 25, 33, 52, 62, null, null],
    [9, null, null, 35, 46, 60, 73, null],
    [10, 27, null, null, 48, 59, null, 86]
  ]
};

const template1B: LoToCard = {
  id: 'template-1B',
  grid: [
    [null, 15, 24, 44, null, 64, 79, null],
    [4, null, 29, 30, null, 51, 76, null],
    [null, 17, 32, null, 53, 63, null, 80],
    [7, null, 23, null, null, 56, 61, 85],
    [11, null, 34, 42, null, null, 72, 87],
    [3, 13, null, null, 45, 54, 74, null],
    [16, 21, null, 43, null, 58, 78, null],
    [6, null, 37, 40, null, 65, null, 82],
    [2, 22, 39, null, 67, null, null, 83]
  ]
};

// Template Pair 2
const template2A: LoToCard = {
  id: 'template-2A',
  grid: [
    [2, null, 21, 37, null, 58, 72, null],
    [null, 16, 29, null, 45, null, 61, 83],
    [7, null, null, 32, 48, 57, null, 85],
    [null, 11, 25, null, 44, 59, 70, null],
    [3, null, 24, 39, null, null, 76, 87],
    [null, 19, null, 33, 46, 55, 78, null],
    [9, null, 28, null, 49, 53, null, 81],
    [null, 13, 27, 35, null, 52, 67, null],
    [5, 18, null, null, 43, null, 69, 89]
  ]
};

const template2B: LoToCard = {
  id: 'template-2B',
  grid: [
    [null, 14, 20, null, 47, 56, null, 84],
    [6, null, null, 31, 41, 54, 75, null],
    [null, 15, 26, null, 40, null, 68, 82],
    [8, null, 22, 36, null, 51, null, 88],
    [null, 10, null, 30, 42, 60, 71, null],
    [4, null, 23, null, 50, null, 65, 86],
    [null, 12, null, 34, 47, null, 77, 90],
    [1, null, 38, null, 62, null, 73, 80],
    [null, 17, null, 64, null, 66, 74, null]
  ]
};

// Template Pair 3
const template3A: LoToCard = {
  id: 'template-3A',
  grid: [
    [3, 15, null, 36, null, 51, null, 82],
    [null, 10, 28, null, 46, null, 74, 88],
    [7, null, null, 33, 42, 59, null, 85],
    [null, 19, 26, null, 48, 54, 63, null],
    [1, null, 24, 37, null, null, 79, 90],
    [null, 11, null, 31, 49, 56, 61, null],
    [8, null, 20, null, 44, 58, null, 83],
    [null, 14, 25, 39, null, 55, 65, null],
    [5, 17, null, null, 47, null, 68, 86]
  ]
};

const template3B: LoToCard = {
  id: 'template-3B',
  grid: [
    [null, 12, 22, null, 43, 57, null, 81],
    [9, null, null, 30, 40, 53, 70, null],
    [null, 16, 29, null, 45, null, 64, 80],
    [2, null, 21, 34, null, 52, null, 87],
    [null, 13, null, 32, 41, 60, 67, null],
    [6, null, 27, null, 50, null, 73, 84],
    [null, 18, null, 35, 45, null, 71, 89],
    [4, null, 23, null, 62, null, 69, 76],
    [null, 38, null, 66, null, 72, 75, 77]
  ]
};

// Template Pair 4
const template4A: LoToCard = {
  id: 'template-4A',
  grid: [
    [4, null, 22, 38, null, 55, 75, null],
    [null, 13, 27, null, 42, null, 62, 81],
    [9, null, null, 31, 45, 58, null, 84],
    [null, 16, 24, null, 49, 53, 66, null],
    [2, null, 29, 35, null, null, 70, 88],
    [null, 10, null, 39, 47, 52, 71, null],
    [7, null, 21, null, 44, 59, null, 83],
    [null, 18, 25, 32, null, 56, 63, null],
    [5, 19, null, null, 41, null, 67, 87]
  ]
};

const template4B: LoToCard = {
  id: 'template-4B',
  grid: [
    [null, 11, 26, null, 43, 51, null, 82],
    [8, null, null, 33, 40, 57, 69, null],
    [null, 14, 20, null, 48, null, 61, 80],
    [1, null, 28, 34, null, 54, null, 85],
    [null, 15, null, 30, 46, 60, 64, null],
    [3, null, 23, null, 50, null, 68, 86],
    [null, 17, null, 36, 43, null, 73, 90],
    [6, null, 37, null, 65, null, 72, 76],
    [null, 12, null, 74, null, 77, 78, 89]
  ]
};

// Template Pair 5
const template5A: LoToCard = {
  id: 'template-5A',
  grid: [
    [6, null, 23, 35, null, 57, 76, null],
    [null, 14, 25, null, 43, null, 64, 82],
    [8, null, null, 30, 49, 55, null, 86],
    [null, 17, 22, null, 47, 58, 68, null],
    [1, null, 27, 33, null, null, 74, 90],
    [null, 12, null, 38, 41, 53, 79, null],
    [5, null, 29, null, 46, 51, null, 84],
    [null, 19, 21, 31, null, 59, 61, null],
    [9, 10, null, null, 44, null, 65, 88]
  ]
};

const template5B: LoToCard = {
  id: 'template-5B',
  grid: [
    [null, 15, 24, null, 45, 52, null, 83],
    [7, null, null, 32, 40, 56, 71, null],
    [null, 11, 28, null, 42, null, 63, 80],
    [3, null, 20, 37, null, 50, null, 85],
    [null, 16, null, 34, 48, 60, 62, null],
    [2, null, 26, null, 54, null, 66, 81],
    [null, 13, null, 36, 45, null, 77, 87],
    [4, null, 39, null, 67, null, 70, 73],
    [null, 18, null, 69, null, 72, 75, 78]
  ]
};

// Template Pair 6
const template6A: LoToCard = {
  id: 'template-6A',
  grid: [
    [1, null, 25, 39, null, 59, 73, null],
    [null, 11, 28, null, 40, null, 60, 80],
    [5, null, null, 34, 45, 52, null, 87],
    [null, 18, 27, null, 48, 56, 65, null],
    [9, null, 21, 30, null, null, 71, 89],
    [null, 13, null, 37, 42, 50, 76, null],
    [2, null, 24, null, 49, 54, null, 81],
    [null, 16, 20, 32, null, 58, 64, null],
    [7, 19, null, null, 47, null, 62, 85]
  ]
};

const template6B: LoToCard = {
  id: 'template-6B',
  grid: [
    [null, 12, 26, null, 46, 51, null, 82],
    [3, null, null, 31, 44, 57, 69, null],
    [null, 14, 22, null, 41, null, 66, 83],
    [6, null, 23, 35, null, 55, null, 84],
    [null, 10, null, 33, 43, 53, 67, null],
    [8, null, 29, null, 55, null, 61, 86],
    [null, 15, null, 36, 47, null, 74, 90],
    [4, null, 38, null, 63, null, 68, 70],
    [null, 17, null, 72, null, 75, 77, 78]
  ]
};

// Template Pair 7
const template7A: LoToCard = {
  id: 'template-7A',
  grid: [
    [7, null, 20, 36, null, 56, 77, null],
    [null, 15, 26, null, 41, null, 63, 83],
    [2, null, null, 33, 47, 51, null, 88],
    [null, 19, 23, null, 46, 55, 61, null],
    [5, null, 28, 31, null, null, 75, 86],
    [null, 11, null, 37, 40, 50, 79, null],
    [9, null, 27, null, 43, 54, null, 81],
    [null, 17, 22, 30, null, 59, 60, null],
    [3, 14, null, null, 49, null, 62, 85]
  ]
};

const template7B: LoToCard = {
  id: 'template-7B',
  grid: [
    [null, 10, 29, null, 44, 52, null, 80],
    [8, null, null, 32, 45, 58, 70, null],
    [null, 16, 21, null, 48, null, 64, 82],
    [1, null, 24, 39, null, 53, null, 84],
    [null, 13, null, 34, 42, 57, 65, null],
    [6, null, 25, null, 57, null, 67, 87],
    [null, 12, null, 35, 45, null, 74, 90],
    [4, null, 38, null, 66, null, 68, 71],
    [null, 18, null, 69, null, 72, 73, 76]
  ]
};

// Template Pair 8
const template8A: LoToCard = {
  id: 'template-8A',
  grid: [
    [9, null, 24, 32, null, 53, 78, null],
    [null, 10, 29, null, 44, null, 66, 84],
    [1, null, null, 37, 42, 50, null, 89],
    [null, 13, 26, null, 49, 52, 60, null],
    [8, null, 21, 30, null, null, 73, 85],
    [null, 18, null, 31, 40, 59, 76, null],
    [3, null, 25, null, 43, 56, null, 80],
    [null, 11, 27, 38, null, 51, 69, null],
    [7, 16, null, null, 48, null, 61, 82]
  ]
};

const template8B: LoToCard = {
  id: 'template-8B',
  grid: [
    [null, 17, 20, null, 45, 58, null, 81],
    [4, null, null, 33, 41, 55, 70, null],
    [null, 12, 28, null, 46, null, 62, 83],
    [5, null, 22, 34, null, 54, null, 86],
    [null, 14, null, 35, 47, 57, 63, null],
    [2, null, 23, null, 54, null, 67, 87],
    [null, 15, null, 36, 45, null, 71, 90],
    [6, null, 39, null, 64, null, 65, 68],
    [null, 19, null, 72, null, 74, 75, 77]
  ]
};

// Template Pair 9
const template9A: LoToCard = {
  id: 'template-9A',
  grid: [
    [5, null, 27, 33, null, 51, 79, null],
    [null, 12, 22, null, 47, null, 67, 85],
    [3, null, null, 39, 40, 52, null, 90],
    [null, 15, 28, null, 43, 50, 62, null],
    [9, null, 20, 32, null, null, 75, 83],
    [null, 19, null, 30, 46, 58, 77, null],
    [1, null, 26, null, 41, 57, null, 82],
    [null, 10, 29, 36, null, 53, 68, null],
    [8, 17, null, null, 49, null, 60, 80]
  ]
};

const template9B: LoToCard = {
  id: 'template-9B',
  grid: [
    [null, 18, 21, null, 44, 59, null, 81],
    [2, null, null, 31, 45, 54, 71, null],
    [null, 11, 25, null, 48, null, 61, 84],
    [7, null, 23, 34, null, 55, null, 87],
    [null, 13, null, 35, 42, 56, 63, null],
    [4, null, 24, null, 54, null, 69, 88],
    [null, 14, null, 37, 45, null, 70, 86],
    [6, null, 38, null, 64, null, 65, 66],
    [null, 16, null, 72, null, 73, 74, 76]
  ]
};

// Template Pair 10
const template10A: LoToCard = {
  id: 'template-10A',
  grid: [
    [6, null, 29, 31, null, 54, 74, null],
    [null, 13, 20, null, 48, null, 69, 86],
    [4, null, null, 38, 41, 53, null, 89],
    [null, 16, 25, null, 42, 51, 63, null],
    [7, null, 22, 33, null, null, 76, 81],
    [null, 17, null, 32, 49, 57, 77, null],
    [2, null, 28, null, 40, 59, null, 83],
    [null, 10, 24, 37, null, 50, 70, null],
    [9, 19, null, null, 47, null, 60, 80]
  ]
};

const template10B: LoToCard = {
  id: 'template-10B',
  grid: [
    [null, 18, 21, null, 43, 58, null, 82],
    [1, null, null, 30, 46, 55, 71, null],
    [null, 11, 26, null, 45, null, 61, 85],
    [8, null, 23, 34, null, 56, null, 87],
    [null, 12, null, 35, 44, 52, 64, null],
    [3, null, 27, null, 54, null, 68, 88],
    [null, 14, null, 36, 45, null, 72, 90],
    [5, null, 39, null, 62, null, 65, 66],
    [null, 15, null, 67, null, 73, 75, 78]
  ]
};

// Export all templates as an array of pairs
export const cardTemplates = [
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
export function getRandomCardTemplate(): LoToCard {
  const randomIndex = Math.floor(Math.random() * cardTemplates.length);

  return cardTemplates[randomIndex];
}
