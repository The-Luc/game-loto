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
    [null, 19, null, 39, null, 55, 60, null, 89]

  ]
};

const template1B: LoToCard = {
  id: 'template-1B',
  backgroundColor: '#1e5ee8', // Dark blue
  grid: [
    [null, 15, 24, 44, null, 64, 79, null, 82],
    [4, null, 29, 30, null, 51, 76, null, 84],
    [null, 17, 32, null, 53, 63, null, 80, null],
    [7, null, 23, null, null, 56, 61, 85, null],
    [null, 11, null, 34, 42, null, null, 72, 87],
    [3, 13, null, null, 45, 54, 74, null, 90],
    [null, 16, 21, null, 43, null, 58, 78, null],
    [6, null, 37, 40, null, 65, null, null, 83],
    [2, 22, null, 39, null, 67, null, null, 86]
  ]
};

// Template Pair 2
const template2A: LoToCard = {
  id: 'template-2A',
  backgroundColor: '#1e8e3e', // Dark green
  grid: [
    [2, null, 21, 37, null, 58, 72, null, 80],
    [null, 16, 29, null, 45, null, 61, 83, null],
    [7, null, null, 32, 48, 57, null, 85, null],
    [null, 11, 25, null, 44, 59, 70, null, 82],
    [3, null, 24, 39, null, null, 76, null, 87],
    [null, 19, null, 33, 46, 55, 78, null, 90],
    [9, null, 28, null, 49, 53, null, 81, null],
    [null, 13, 27, 35, null, 52, 67, null, 84],
    [5, 18, null, null, 43, null, 69, null, 89]
  ]
};

const template2B: LoToCard = {
  id: 'template-2B',
  backgroundColor: '#1e8e3e', // Dark green
  grid: [
    [null, 14, 20, null, 47, 56, null, 84, null],
    [6, null, null, 31, 41, 54, 75, null, 81],
    [null, 15, 26, null, 40, null, 68, 82, null],
    [8, null, 22, 36, null, 51, null, 88, null],
    [null, 10, null, 30, 42, 60, 71, null, 83],
    [4, null, 23, null, 50, null, 65, 86, null],
    [null, 12, null, 34, null, null, 77, 90, null],
    [1, null, 38, null, 62, null, 73, null, 80],
    [null, 17, null, null, 64, 66, 74, null, 89]
  ]
};

// Template Pair 3
const template3A: LoToCard = {
  id: 'template-3A',
  backgroundColor: '#6a1b9a', // Dark purple
  grid: [
    [3, 15, null, 36, null, 51, null, 82, null],
    [null, 10, 28, null, 46, null, 74, 88, null],
    [7, null, null, 33, 42, 59, null, 85, null],
    [null, 19, 26, null, 48, 54, 63, null, 80],
    [1, null, 24, 37, null, null, 79, null, 90],
    [null, 11, null, 31, 49, 56, 61, null, 89],
    [8, null, 20, null, 44, 58, null, 83, null],
    [null, 14, 25, 39, null, 55, 65, null, 81],
    [5, 17, null, null, 47, null, 68, 86, null]
  ]
};

const template3B: LoToCard = {
  id: 'template-3B',
  backgroundColor: '#6a1b9a', // Dark purple
  grid: [
    [null, 12, 22, null, 43, 57, null, 81, null],
    [9, null, null, 30, 40, 53, 70, null, 82],
    [null, 16, 29, null, 45, null, 64, 80, null],
    [2, null, 21, 34, null, 52, null, 87, null],
    [null, 13, null, 32, 41, 60, 67, null, 78],
    [6, null, 27, null, 50, null, 73, 84, null],
    [null, 18, null, 35, null, null, 71, 89, null],
    [4, null, 23, null, 62, null, 69, null, 76],
    [null, null, 38, null, 66, 72, 75, 77, null]
  ]
};

// Template Pair 4
const template4A: LoToCard = {
  id: 'template-4A',
  backgroundColor: '#b7950b', // Dark gold
  grid: [
    [4, null, 22, 38, null, 55, 75, null, 80],
    [null, 13, 27, null, 42, null, 62, 81, null],
    [9, null, null, 31, 45, 58, null, 84, null],
    [null, 16, 24, null, 49, 53, 66, null, 82],
    [2, null, 29, 35, null, null, 70, null, 88],
    [null, 10, null, 39, 47, 52, 71, null, 90],
    [7, null, 21, null, 44, 59, null, 83, null],
    [null, 18, 25, 32, null, 56, 63, null, 85],
    [5, 19, null, null, 41, null, 67, null, 87]
  ]
};

const template4B: LoToCard = {
  id: 'template-4B',
  backgroundColor: '#b7950b', // Dark gold
  grid: [
    [null, 11, 26, null, 43, 51, null, 82, null],
    [8, null, null, 33, 40, 57, 69, null, 79],
    [null, 14, 20, null, 48, null, 61, 80, null],
    [1, null, 28, 34, null, 54, null, 85, null],
    [null, 15, null, 30, 46, 60, 64, null, 83],
    [3, null, 23, null, 50, null, 68, 86, null],
    [null, 17, null, 36, null, null, 73, 90, null],
    [6, null, 37, null, 65, null, 72, null, 76],
    [null, 12, null, null, 74, 77, 78, 89, null]
  ]
};

// Template Pair 5
const template5A: LoToCard = {
  id: 'template-5A',
  backgroundColor: '#9c1258', // Dark magenta
  grid: [
    [6, null, 23, 35, null, 57, 76, null, 80],
    [null, 14, 25, null, 43, null, 64, 82, null],
    [8, null, null, 30, 49, 55, null, 86, null],
    [null, 17, 22, null, 47, 58, 68, null, 81],
    [1, null, 27, 33, null, null, 74, null, 90],
    [null, 12, null, 38, 41, 53, 79, null, 89],
    [5, null, 29, null, 46, 51, null, 84, null],
    [null, 19, 21, 31, null, 59, 61, null, 83],
    [9, 10, null, null, 44, null, 65, null, 88]
  ]
};

const template5B: LoToCard = {
  id: 'template-5B',
  backgroundColor: '#9c1258', // Dark magenta
  grid: [
    [null, 15, 24, null, 45, 52, null, 83, null],
    [7, null, null, 32, 40, 56, 71, null, 85],
    [null, 11, 28, null, 42, null, 63, 80, null],
    [3, null, 20, 37, null, 50, null, null, 87],
    [null, 16, null, 34, 48, 60, 62, null, 82],
    [2, null, 26, null, 54, null, 66, 81, null],
    [null, 13, null, 36, null, null, 77, null, 89],
    [4, null, 39, null, 67, null, 70, null, 73],
    [null, 18, null, null, 69, 72, 75, 78, null]
  ]
};

// Template Pair 6
const template6A: LoToCard = {
  id: 'template-6A',
  backgroundColor: '#00838f', // Dark teal
  grid: [
    [1, null, 25, 39, null, 59, 73, null, 82],
    [null, 11, 28, null, 40, null, 60, 80, null],
    [5, null, null, 34, 45, 52, null, 87, null],
    [null, 18, 27, null, 48, 56, 65, null, 83],
    [9, null, 21, 30, null, null, 71, null, 89],
    [null, 13, null, 37, 42, 50, 76, null, 90],
    [2, null, 24, null, 49, 54, null, 81, null],
    [null, 16, 20, 32, null, 58, 64, null, 86],
    [7, 19, null, null, 47, null, 62, 85, null]
  ]
};

const template6B: LoToCard = {
  id: 'template-6B',
  backgroundColor: '#00838f', // Dark teal
  grid: [
    [null, 12, 26, null, 46, 51, null, 82, null],
    [3, null, null, 31, 44, 57, 69, null, 79],
    [null, 14, 22, null, 41, null, 66, 83, null],
    [6, null, 23, 35, null, 55, null, 84, null],
    [null, 10, null, 33, 43, 53, 67, null, 88],
    [8, null, 29, null, null, null, 61, 86, null],
    [null, 15, null, 36, 47, null, 74, 90, null],
    [4, null, 38, null, 63, null, 68, null, 70],
    [null, 17, null, null, 72, 75, 77, 78, null]
  ]
};

// Template Pair 7
const template7A: LoToCard = {
  id: 'template-7A',
  backgroundColor: '#e65100', // Dark orange
  grid: [
    [7, null, 20, 36, null, 56, 77, null, 80],
    [null, 15, 26, null, 41, null, 63, 83, null],
    [2, null, null, 33, 47, 51, null, 88, null],
    [null, 19, 23, null, 46, 55, 61, null, 82],
    [5, null, 28, 31, null, null, 75, null, 86],
    [null, 11, null, 37, 40, 50, 79, null, 90],
    [9, null, 27, null, 43, 54, null, 81, null],
    [null, 17, 22, 30, null, 59, 60, null, 84],
    [3, 14, null, null, 49, null, 62, 85, null]
  ]
};

const template7B: LoToCard = {
  id: 'template-7B',
  backgroundColor: '#e65100', // Dark orange
  grid: [
    [null, 10, 29, null, 44, 52, null, 80, null],
    [8, null, null, 32, 45, 58, 70, null, 81],
    [null, 16, 21, null, 48, null, 64, 82, null],
    [1, null, 24, 39, null, 53, null, 84, null],
    [null, 13, null, 34, 42, null, 65, null, 89],
    [6, null, 25, null, null, 57, 67, 87, null],
    [null, 12, null, 35, null, null, 74, 90, null],
    [4, null, 38, null, 66, null, 68, null, 71],
    [null, 18, null, null, 69, 72, 73, 76, null]
  ]
};

// Template Pair 8
const template8A: LoToCard = {
  id: 'template-8A',
  backgroundColor: '#2e7d32', // Dark forest green
  grid: [
    [9, null, 24, 32, null, 53, 78, null, 81],
    [null, 10, 29, null, 44, null, 66, 84, null],
    [1, null, null, 37, 42, 50, null, 89, null],
    [null, 13, 26, null, 49, 52, 60, null, 83],
    [8, null, 21, 30, null, null, 73, null, 85],
    [null, 18, null, 31, 40, 59, 76, null, 90],
    [3, null, 25, null, 43, 56, null, 80, null],
    [null, 11, 27, 38, null, 51, 69, null, 86],
    [7, 16, null, null, 48, null, 61, 82, null]
  ]
};

const template8B: LoToCard = {
  id: 'template-8B',
  backgroundColor: '#2e7d32', // Dark forest green
  grid: [
    [null, 17, 20, null, 45, 58, null, 81, null],
    [4, null, null, 33, 41, 55, 70, null, 79],
    [null, 12, 28, null, 46, null, 62, 83, null],
    [5, null, 22, 34, null, 54, null, 86, null],
    [null, 14, null, 35, 47, 57, 63, null, 88],
    [2, null, 23, null, null, null, 67, 87, null],
    [null, 15, null, 36, null, null, 71, 90, null],
    [6, null, 39, null, 64, null, 65, null, 68],
    [null, 19, null, null, 72, 74, 75, 77, null]
  ]
};

// Template Pair 9
const template9A: LoToCard = {
  id: 'template-9A',
  backgroundColor: '#303f9f', // Dark indigo
  grid: [
    [5, null, 27, 33, null, 51, 79, null, 81],
    [null, 12, 22, null, 47, null, 67, 85, null],
    [3, null, null, 39, 40, 52, null, 90, null],
    [null, 15, 28, null, 43, 50, 62, null, 84],
    [9, null, 20, 32, null, null, 75, null, 83],
    [null, 19, null, 30, 46, 58, 77, null, 89],
    [1, null, 26, null, 41, 57, null, 82, null],
    [null, 10, 29, 36, null, 53, 68, null, 86],
    [8, 17, null, null, 49, null, 60, 80, null]
  ]
};

const template9B: LoToCard = {
  id: 'template-9B',
  backgroundColor: '#303f9f', // Dark indigo
  grid: [
    [null, 16, 21, null, 44, 59, null, 81, null],
    [2, null, null, 31, 45, 54, 71, null, 78],
    [null, 11, 25, null, 48, null, 61, 84, null],
    [7, null, 23, 34, null, 55, null, 87, null],
    [null, 13, null, 35, 42, 56, 63, null, 88],
    [4, null, 24, null, null, null, 69, null, 91],
    [null, 14, null, 37, null, null, 70, 86, null],
    [6, null, 38, null, 64, null, 65, null, 66],
    [null, 18, null, null, 72, 73, 74, 76, null]
  ]
};

// Template Pair 10
const template10A: LoToCard = {
  id: 'template-10A',
  backgroundColor: '#006064', // Dark cyan
  grid: [
    [6, null, 29, 31, null, 54, 74, null, 82],
    [null, 13, 20, null, 48, null, 69, 86, null],
    [4, null, null, 38, 41, 53, null, 89, null],
    [null, 16, 25, null, 42, 51, 63, null, 84],
    [7, null, 22, 33, null, null, 76, null, 81],
    [null, 17, null, 32, 49, 57, 77, null, 90],
    [2, null, 28, null, 40, 59, null, 83, null],
    [null, 10, 24, 37, null, 50, 70, null, 85],
    [9, 19, null, null, 47, null, 60, 80, null]
  ]
};

const template10B: LoToCard = {
  id: 'template-10B',
  backgroundColor: '#006064', // Dark cyan
  grid: [
    [null, 15, 21, null, 43, 58, null, 82, null],
    [1, null, null, 30, 46, 55, 71, null, 79],
    [null, 11, 26, null, 45, null, 61, 85, null],
    [8, null, 23, 34, null, 56, null, 87, null],
    [null, 12, null, 35, 44, 52, 64, null, 91],
    [3, null, 27, null, null, null, 68, 88, null],
    [null, 14, null, 36, null, null, 72, 90, null],
    [5, null, 39, null, 62, null, 65, null, 66],
    [null, 18, null, null, 67, 73, 75, 78, null]
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
