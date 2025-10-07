import { findHint } from './hintService';

// --- SUDOKU GENERATOR SERVICE ---
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

const countSolutions = (grid) => {
  let count = 0;
  function solve() {
    if (count > 1) return;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(grid, r, c, num)) {
              grid[r][c] = num;
              solve();
              grid[r][c] = 0; // Backtrack
            }
          }
          return;
        }
      }
    }
    count++;
  }
  solve();
  return count;
};

const REMOVAL_COUNT = {
  easy: 40,
  medium: 48,
  hard: 54,
  professional: 58,
};

const DIFFICULTY_SCORES = {
  easy: { min: 1, max: 2 },
  medium: { min: 3, max: 4 },
  hard: { min: 5, max: 7 },
  professional: { min: 8, max: 99 },
};

const ratePuzzleDifficulty = (puzzle) => {
    let board = puzzle.map(row =>
      row.map(value => ({
        value,
        userNotes: new Set(),
        autoNotes: new Set(),
        eliminatedNotes: new Set(),
      }))
    );
    let maxScore = 0;
    let stuck = false;
    while (!stuck) {
        let moveMade = false;
        const techniques = [
            { id: 'nakedSingle', score: 1 },
            { id: 'hiddenSingle', score: 2 },
            { id: 'nakedPair', score: 3 },
            { id: 'hiddenPair', score: 4 },
            { id: 'nakedTriple', score: 5 },
            { id: 'hiddenTriple', score: 6 },
            { id: 'intersectionRemoval', score: 7 },
            { id: 'xWing', score: 8 },
            { id: 'swordfish', score: 9 },
            { id: 'xyWing', score: 10 },
            { id: 'jellyfish', score: 11 },
        ];
        for (const technique of techniques) {
            const hint = findHint(board, 'professional', null, technique.id); // Check all techniques
            if (hint) {
                maxScore = Math.max(maxScore, technique.score);
                if (hint.solve) {
                    const { row, col, num } = hint.solve;
                    board[row][col].value = num;
                    board[row][col].eliminatedNotes.clear();
                } else if (hint.eliminations.length > 0) {
                    hint.eliminations.forEach(({ row, col, num }) => {
                        board[row][col].eliminatedNotes.add(num);
                    });
                }
                moveMade = true;
                break;
            }
        }
        if (!moveMade) {
            stuck = true;
        }
    }
    const isSolved = board.every(row => row.every(cell => cell.value !== 0));
    return isSolved ? maxScore : 999; // Use a large number for unsolvable puzzles
};

export const generateSudoku = (difficulty = 'medium') => {
  let puzzle, solution;
  const targetDifficulty = DIFFICULTY_SCORES[difficulty];

  // This loop will continue indefinitely until a puzzle matching the criteria is found.
  // This guarantees a valid puzzle is always returned.
  do {
    solution = Array(9).fill(0).map(() => Array(9).fill(0));
    solveGrid(solution);
    const candidatePuzzle = solution.map(row => [...row]);
    const cells = [];
    for (let r = 0; r < 9; r++) { for (let c = 0; c < 9; c++) { cells.push({ r, c }); } }
    shuffle(cells);
    let removedCount = 0;
    const cellsToRemove = REMOVAL_COUNT[difficulty] ?? 48;
    for (const cell of cells) {
      if (removedCount >= cellsToRemove) { break; }
      const { r, c } = cell;
      const backup = candidatePuzzle[r][c];
      candidatePuzzle[r][c] = 0;
      const puzzleCopy = candidatePuzzle.map(row => [...row]);
      if (countSolutions(puzzleCopy) !== 1) {
        candidatePuzzle[r][c] = backup;
      } else {
        removedCount++;
      }
    }
    const puzzleScore = ratePuzzleDifficulty(candidatePuzzle);
    if (puzzleScore >= targetDifficulty.min && puzzleScore <= targetDifficulty.max) {
      puzzle = candidatePuzzle;
    }
    // If puzzle is not set, the loop continues.
  } while (!puzzle);

  return { puzzle, solution };
};
