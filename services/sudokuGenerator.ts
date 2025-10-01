/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const isSafe = (grid, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

const solveGrid = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const DIFFICULTY_LEVELS = {
  easy: 40,
  medium: 48,
  hard: 54,
  professional: 58,
};

export const generateSudoku = (difficulty = 'medium') => {
  const solution = Array(9).fill(0).map(() => Array(9).fill(0));
  solveGrid(solution);
  const puzzle = solution.map(row => [...row]);
  let attempts = DIFFICULTY_LEVELS[difficulty] ?? 48;
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      attempts--;
    }
  }
  return { puzzle, solution };
};
