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
  professional: 62, // Increased to generate harder base puzzles
};

const DIFFICULTY_SCORES = {
  easy: { min: 45, max: 60 },
  medium: { min: 61, max: 120 },
  hard: { min: 121, max: 499 },
  professional: { min: 500, max: 9998, minEliteMoves: 4 },
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
    
    const techniqueScores = {
        nakedSingle: 1,
        hiddenSingle: 2,
        nakedPair: 5,
        hiddenPair: 8,
        nakedTriple: 10,
        hiddenTriple: 12,
        intersectionRemoval: 15,
        xWing: 100,
        skyscraper: 110,
        twoStringKite: 120,
        xyWing: 150,
        xyzWing: 180,
        swordfish: 200,
        jellyfish: 250,
        uniqueRectangle: 250,
    };
    
    const eliteTechniques = new Set([
      'xWing', 'skyscraper', 'twoStringKite', 'xyWing', 'xyzWing', 'swordfish', 'jellyfish', 'uniqueRectangle'
    ]);
    
    const orderedTechniques = [
        'nakedSingle', 'hiddenSingle', 'nakedPair', 'hiddenPair', 
        'nakedTriple', 'hiddenTriple', 'intersectionRemoval', 'xWing', 
        'skyscraper', 'twoStringKite', 'xyWing', 'xyzWing', 'swordfish', 
        'jellyfish', 'uniqueRectangle'
    ];

    let totalScore = 0;
    let eliteMovesCount = 0;
    let stuck = false;

    while (!stuck) {
        let moveMade = false;
        
        for (const techniqueId of orderedTechniques) {
            const hint = findHint(board, 'professional', null, techniqueId);
            if (hint) {
                totalScore += techniqueScores[techniqueId] || 0;
                if (eliteTechniques.has(techniqueId)) {
                    eliteMovesCount++;
                }

                if (hint.solve) {
                    const { row, col, num } = hint.solve;
                    board[row][col].value = num;
                    board[row][col].userNotes.clear();
                    board[row][col].autoNotes.clear();
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
    return isSolved ? { score: totalScore, eliteMoves: eliteMovesCount } : { score: 9999, eliteMoves: 0 };
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
    const { score: puzzleScore, eliteMoves: puzzleEliteMoves } = ratePuzzleDifficulty(candidatePuzzle);

    if (
      puzzleScore >= targetDifficulty.min && 
      puzzleScore <= targetDifficulty.max &&
      (!targetDifficulty.minEliteMoves || puzzleEliteMoves >= targetDifficulty.minEliteMoves)
    ) {
      puzzle = candidatePuzzle;
    }
    // If puzzle is not set, the loop continues.
  } while (!puzzle);

  return { puzzle, solution };
};