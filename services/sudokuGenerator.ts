/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Helper to shuffle an array
const shuffle = (array: number[]): number[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Check if a number is safe to place in the grid
const isSafe = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check if 'num' is not in the current row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) {
      return false;
    }
  }

  // Check if 'num' is not in the current column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) {
      return false;
    }
  }

  // Check if 'num' is not in the current 3x3 subgrid
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
};

// Recursive backtracking function to fill the Sudoku grid
const solveGrid = (grid: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) { // Find an empty cell
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num; // Try placing a number
            if (solveGrid(grid)) {
              return true; // If it leads to a solution, we're done
            }
            grid[row][col] = 0; // Otherwise, backtrack
          }
        }
        return false; // If no number works, trigger backtracking
      }
    }
  }
  return true; // All cells are filled
};

export type Difficulty = 'easy' | 'medium' | 'hard' | 'professional';

const DIFFICULTY_LEVELS: Record<Difficulty, number> = {
  easy: 40,
  medium: 48,
  hard: 54,
  professional: 58,
};

/**
 * Generates a new Sudoku puzzle and its complete solution.
 * @returns An object containing the puzzle grid (with empty cells) and the solution grid.
 */
export const generateSudoku = (difficulty: Difficulty = 'medium'): { puzzle: number[][]; solution: number[][] } => {
  const solution = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // 1. Generate a full, valid Sudoku board (the solution)
  solveGrid(solution);

  // 2. Create a deep copy for the puzzle
  const puzzle = solution.map(row => [...row]);

  // 3. Remove numbers to create the puzzle.
  // The number of attempts determines the puzzle's difficulty.
  // More attempts = more removed cells = harder puzzle.
  let attempts = DIFFICULTY_LEVELS[difficulty] ?? 48; // Default to medium if invalid
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