/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSudoku, Difficulty } from './services/sudokuGenerator';
import Header from './components/Header';
import SudokuBoard from './components/StartScreen'; // Overwritten to be the SudokuBoard component
import NumberPad from './components/AdjustmentPanel'; // Overwritten to be the NumberPad component
import Controls from './components/CropPanel'; // Overwritten to be the Controls component
import { CellData } from './components/FilterPanel'; // Overwritten to be the Cell component
import VictoryScreen from './components/VictoryScreen';
import SettingsPanel from './components/SettingsPanel';
import StatsPanel from './components/StatsPanel';

type AnimationState = 'idle' | 'playing' | 'finished';

export interface DifficultyStats {
  wins: number;
  bestTime: number | null; // in ms
  totalTime: number; // in ms
}

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  totalMoves: number;
  totalMistakes: number;
  byDifficulty: Record<Difficulty, DifficultyStats>;
}

const initialStats: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalMoves: 0,
  totalMistakes: 0,
  byDifficulty: {
    easy: { wins: 0, bestTime: null, totalTime: 0 },
    medium: { wins: 0, bestTime: null, totalTime: 0 },
    hard: { wins: 0, bestTime: null, totalTime: 0 },
    professional: { wins: 0, bestTime: null, totalTime: 0 },
  },
};


const victoryMessages = [
  // Marvel Cinematic Universe
  "Perfectly solved, as all grids should be.", // Thanos
  "This solve was... inevitable.", // Thanos
  "Numbers... Assemble.", // The Avengers
  "That's my secret: I'm always thinking.", // Hulk
  "Dread it. Run from it. The numbers arrive all the same.", // Thanos

  // Star Wars & The Mandalorian
  "The Logic is strong with this one.", // Darth Vader
  "This is the way.", // The Mandalorian
  "These are the digits you're looking for.", // Obi-Wan Kenobi
  "We will watch your career with great interest.", // Emperor Palpatine
  "I find your lack of empty cells... pleasing.", // Darth Vader
  "True Jedi.", // LEGO Star Wars
  "Never tell me the odds!", // Han Solo
  "It's over, puzzle. I have the high ground.", // Obi-Wan Kenobi

  // Lord of the Rings & The Hobbit
  "One grid to rule them all.", // Fellowship of the Ring
  "My precious... solution.", // Gollum
  "Not all those who ponder are lost.", // J.R.R. Tolkien
  "Looks like victory is back on the menu.", // Uruk-hai
  "One does not simply solve this grid... but you did.", // Boromir

  // Harry Potter Universe
  "Mischief Managed.", // Harry Potter
  "You're a wizard, solver.", // Hagrid
  "10 points for that solve!", // Dumbledore
  
  // Other Iconic Movies
  "He who controls the numbers controls the grid.", // Dune
  "That's got to be the best solver I've ever seen.", // Pirates of the Caribbean
  "Pencils? Where we're going, we don't need pencils.", // Back to the Future
  "Houston, we have a solution.", // Apollo 13 - Slight variation
  "Are you not entertained?!", // Gladiator
  "This puzzle has been terminated.", // The Terminator

  // Video Games & Memes
  "Calculated.", // Rocket League
  "What a solve!", // Rocket League
  "This is Sudoku!", // Rocket League (Parody)
  "Steeeerike!", // Wii Sports
  "Home Run!", // Wii Sports
  "Nice shot!", // Wii Sports
  "The numbers, Mason! I figured them out!", // Call of Duty: Black Ops
  "All your boxes are belong to us.", // Zero Wing (Meme)
];

const SAVED_GAME_KEY = 'sudoku-saved-game';
const SUDOKU_STATS_KEY = 'sudoku-stats';

// Custom JSON replacer to handle Set serialization.
const serializeSets = (key: string, value: any) => {
  if (value instanceof Set) {
    return { __dataType: 'Set', value: [...value] };
  }
  return value;
};

// Custom JSON reviver to handle Set deserialization.
const deserializeSets = (key: string, value: any) => {
  if (typeof value === 'object' && value !== null && value.__dataType === 'Set') {
    return new Set(value.value);
  }
  return value;
};

const deepCopyBoard = (board: CellData[][]): CellData[][] => {
  return board.map(row => 
    row.map(cell => ({
      ...cell,
      userNotes: new Set(cell.userNotes),
      autoNotes: new Set(cell.autoNotes),
      eliminatedNotes: new Set(cell.eliminatedNotes),
    }))
  );
};


const App: React.FC = () => {
  const [board, setBoard] = useState<CellData[][]>([]);
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [history, setHistory] = useState<CellData[][][]>([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [victoryMessage, setVictoryMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    () => (localStorage.getItem('sudoku-difficulty') as Difficulty) || 'medium'
  );

  const [isAutoNotesEnabled, setIsAutoNotesEnabled] = useState(
    () => localStorage.getItem('sudoku-auto-notes') === 'true'
  );

  const [isHighlightNotesEnabled, setIsHighlightNotesEnabled] = useState(
    () => localStorage.getItem('sudoku-highlight-notes') === 'true'
  );

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('sudoku-dark-mode');
    if (savedMode) return savedMode === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  
  const [stats, setStats] = useState<Stats>(() => {
    try {
      const savedStats = localStorage.getItem(SUDOKU_STATS_KEY);
      return savedStats ? JSON.parse(savedStats) : initialStats;
    } catch (e) {
      console.error("Error loading stats:", e);
      return initialStats;
    }
  });

  // State for hint visuals and logic
  const [hintTargetCell, setHintTargetCell] = useState<{row: number, col: number} | null>(null);
  const [activeHint, setActiveHint] = useState<{row: number, col: number, level: number} | null>(null);
  const [isHintOnCooldown, setIsHintOnCooldown] = useState(false);
  const [hintUsageCount, setHintUsageCount] = useState(0);
  const [hintCooldownDuration, setHintCooldownDuration] = useState(5); // in seconds
  const cooldownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    
    const durations = [5, 10, 20, 30, 60]; // in seconds
    const currentDuration = durations[Math.min(hintUsageCount, durations.length - 1)];
    setHintCooldownDuration(currentDuration);

    setIsHintOnCooldown(true);
    let timer = currentDuration;

    cooldownIntervalRef.current = window.setInterval(() => {
      timer -= 1;
      if (timer <= 0) {
        clearInterval(cooldownIntervalRef.current!);
        setIsHintOnCooldown(false);
      }
    }, 1000);
  }, [hintUsageCount]);


  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('sudoku-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sudoku-auto-notes', String(isAutoNotesEnabled));
  }, [isAutoNotesEnabled]);
  
  useEffect(() => {
    localStorage.setItem(SUDOKU_STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('sudoku-highlight-notes', String(isHighlightNotesEnabled));
  }, [isHighlightNotesEnabled]);

  // State for game statistics
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  
  const clearProgressiveHint = useCallback(() => {
    setActiveHint(null);
  }, []);

  const clearHintHighlights = useCallback(() => {
    setHintTargetCell(null);
  }, []);

  const clearAllHintEffects = useCallback(() => {
    clearHintHighlights();
    clearProgressiveHint();
  }, [clearHintHighlights, clearProgressiveHint]);


  const triggerWinState = useCallback(() => {
    const randomMessage = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
    const gameDuration = Date.now() - startTime;
    
    setStats(prev => {
        const difficultyStats = prev.byDifficulty[difficulty];
        
        const newBestTime = difficultyStats.bestTime === null || gameDuration < difficultyStats.bestTime 
          ? gameDuration 
          : difficultyStats.bestTime;
          
        return {
          ...prev,
          gamesWon: prev.gamesWon + 1,
          totalMoves: prev.totalMoves + movesCount,
          totalMistakes: prev.totalMistakes + mistakesCount,
          byDifficulty: {
            ...prev.byDifficulty,
            [difficulty]: {
              wins: difficultyStats.wins + 1,
              bestTime: newBestTime,
              totalTime: difficultyStats.totalTime + gameDuration,
            }
          }
        };
      });

    setVictoryMessage(randomMessage);
    setIsGameWon(true);
    setEndTime(Date.now());
    setSelectedCell(null);
    clearAllHintEffects();
    localStorage.removeItem(SAVED_GAME_KEY); // Clear saved game on win
  }, [clearAllHintEffects, startTime, difficulty, movesCount, mistakesCount]);

  const checkWinCondition = useCallback((currentBoard: CellData[][]) => {
    if (solution.length === 0) return false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c].value === 0 || currentBoard[r][c].value !== solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, [solution]);
  
  const getCandidates = (currentBoard: CellData[][], row: number, col: number): Set<number> => {
      const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const gridValues = currentBoard.map(r => r.map(c => c.value));
      for (let i = 0; i < 9; i++) {
          if (gridValues[row][i] !== 0) candidates.delete(gridValues[row][i]);
          if (gridValues[i][col] !== 0) candidates.delete(gridValues[i][col]);
      }
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      for (let i = boxStartRow; i < boxStartRow + 3; i++) {
          for (let j = boxStartCol; j < boxStartCol + 3; j++) {
              if (gridValues[i][j] !== 0) candidates.delete(gridValues[i][j]);
          }
      }
      return candidates;
  };

  const startNewGame = useCallback((gameDifficulty: Difficulty) => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(gameDifficulty);
    
    setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
    }));
    
    setPuzzle(newPuzzle);
    setSolution(newSolution);

    let newBoard = newPuzzle.map(row =>
      row.map(value => ({
        value,
        isInitial: value !== 0,
        isWrong: false,
        userNotes: new Set<number>(),
        autoNotes: new Set<number>(),
        eliminatedNotes: new Set<number>(),
      }))
    );

    if (isAutoNotesEnabled) {
      for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
              if (newBoard[r][c].value === 0) {
                  newBoard[r][c].autoNotes = getCandidates(newBoard, r, c);
              }
          }
      }
    }

    setBoard(newBoard);
    setSelectedCell(null);
    setIsNotesMode(false);
    setHistory([]);
    setIsGameWon(false);
    setAnimationState('idle');
    clearAllHintEffects();
    
    // Reset hint cooldown and usage
    setIsHintOnCooldown(false);
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    setHintUsageCount(0);

    // Reset stats for new game
    setStartTime(Date.now());
    setEndTime(0);
    setMovesCount(0);
    setMistakesCount(0);
  }, [isAutoNotesEnabled, clearAllHintEffects]);

  // Load game state on initial mount
  useEffect(() => {
    const savedGameJson = localStorage.getItem(SAVED_GAME_KEY);
    if (savedGameJson) {
      try {
        const savedGame = JSON.parse(savedGameJson, deserializeSets);
        setBoard(savedGame.board);
        setPuzzle(savedGame.puzzle);
        setSolution(savedGame.solution);
        setHistory(savedGame.history);
        setStartTime(savedGame.startTime);
        setMovesCount(savedGame.movesCount);
        setMistakesCount(savedGame.mistakesCount);
        setHintUsageCount(savedGame.hintUsageCount || 0);
        // Sync difficulty with the loaded game's difficulty
        if (savedGame.difficulty && savedGame.difficulty !== difficulty) {
            setDifficulty(savedGame.difficulty);
            localStorage.setItem('sudoku-difficulty', savedGame.difficulty);
        }
      } catch (e) {
        console.error("Error loading saved game:", e);
        localStorage.removeItem(SAVED_GAME_KEY); // Clear corrupted data
        startNewGame(difficulty);
      }
    } else {
      startNewGame(difficulty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect should only run once on component mount.

  // Save game state whenever it changes
  useEffect(() => {
    // Don't save if the board isn't initialized, or if the game is won.
    if (board.length === 0 || isGameWon) {
      return;
    }
    const gameState = {
      board,
      puzzle,
      solution,
      history,
      startTime,
      movesCount,
      mistakesCount,
      difficulty,
      hintUsageCount,
    };
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(gameState, serializeSets));
  }, [board, puzzle, solution, history, startTime, movesCount, mistakesCount, difficulty, isGameWon, hintUsageCount]);
  
  useEffect(() => {
    if (isGameWon) {
      setAnimationState('playing');
      const timer = setTimeout(() => {
        setAnimationState('finished');
      }, 1500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isGameWon]);


  const handleCellClick = (row: number, col: number) => {
    if (isGameWon) return;

    // If the user clicks on the specifically highlighted hint cell,
    // clear the highlight and proceed with selection.
    if (hintTargetCell && hintTargetCell.row === row && hintTargetCell.col === col) {
      clearHintHighlights();
    }
    
    // A progressive hint is active on a different cell, and the user clicks away.
    // This should clear the progressive hint state.
    if (activeHint && (activeHint.row !== row || activeHint.col !== col)) {
        clearProgressiveHint();
    }

    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ row, col });
    }
  };

  const placeNumberOnBoard = useCallback((row: number, col: number, num: number, isFromHint: boolean = false) => {
    setHistory(prev => [...prev, board]);
    clearAllHintEffects();

    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];
    
    if (!isFromHint) {
        setMovesCount(prev => prev + 1);
    }
    cell.value = num;
    cell.userNotes.clear();
    cell.autoNotes.clear();
    cell.eliminatedNotes.clear();
    
    const isCorrect = solution[row][col] === num;
    cell.isWrong = !isCorrect;
    
    if (!isCorrect && !isFromHint) {
        setMistakesCount(prev => prev + 1);
    }
    
    if (isCorrect) {
        for (let c = 0; c < 9; c++) {
            newBoard[row][c].userNotes.delete(num);
            newBoard[row][c].autoNotes.delete(num);
        }
        for (let r = 0; r < 9; r++) {
            newBoard[r][col].userNotes.delete(num);
            newBoard[r][col].autoNotes.delete(num);
        }
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                newBoard[r][c].userNotes.delete(num);
                newBoard[r][c].autoNotes.delete(num);
            }
        }
        
        if (checkWinCondition(newBoard)) {
            triggerWinState();
        }
    }
    setBoard(newBoard);
  }, [board, solution, clearAllHintEffects, checkWinCondition, triggerWinState]);

  const handleNumberClick = useCallback((num: number) => {
    if (!selectedCell || isGameWon || solution.length === 0) return;

    const { row, col } = selectedCell;
    const cellData = board[row][col];
    if (cellData.isInitial) return;

    if (isNotesMode) {
        if (cellData.eliminatedNotes.has(num)) {
            return; // Cannot interact with red "eliminated" notes
        }
        
        const willChange = !cellData.eliminatedNotes.has(num);
        if (!willChange) return;

        setHistory(prev => [...prev, board]);
        clearAllHintEffects();
        
        const newBoard = deepCopyBoard(board);
        const cell = newBoard[row][col];

        const isAdding = !cell.userNotes.has(num) && !cell.autoNotes.has(num);
        if (isAdding) {
            cell.userNotes.add(num);
        } else {
            cell.userNotes.delete(num);
            cell.autoNotes.delete(num);
        }
        cell.value = 0;
        setBoard(newBoard);
    } else {
        placeNumberOnBoard(row, col, num);
    }
  }, [board, isNotesMode, selectedCell, isGameWon, solution, clearAllHintEffects, placeNumberOnBoard]);
  
  const handleToggleNotesMode = useCallback(() => {
    if (isGameWon) return;
    setIsNotesMode(prev => !prev);
  }, [isGameWon]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isGameWon) return;
    const lastState = history[history.length - 1];
    setBoard(lastState);
    setHistory(history.slice(0, -1));
    clearAllHintEffects();
  }, [board, history, isGameWon, clearAllHintEffects]);

  const handleDelete = useCallback(() => {
    if (!selectedCell || isGameWon) return;

    const { row, col } = selectedCell;
    const cellToDelete = board[row][col];

    if (cellToDelete.isInitial) return;

    if (cellToDelete.value === 0 && cellToDelete.userNotes.size === 0 && cellToDelete.autoNotes.size === 0 && cellToDelete.eliminatedNotes.size === 0) {
      return;
    }

    setHistory(prev => [...prev, board]);
    clearAllHintEffects();

    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];
    cell.value = 0;
    cell.userNotes.clear();
    cell.autoNotes.clear();
    cell.eliminatedNotes.clear();
    cell.isWrong = false;
    setBoard(newBoard);
  }, [board, selectedCell, isGameWon, clearAllHintEffects]);


  const handleHint = useCallback(() => {
    if (isHintOnCooldown || isGameWon || solution.length === 0) return;

    let hintActionTaken = false;
    const isHintableCellSelected = selectedCell && !board[selectedCell.row][selectedCell.col].isInitial && board[selectedCell.row][selectedCell.col].value === 0;

    // Scenario 1: A valid cell is selected.
    if (isHintableCellSelected) {
        const { row, col } = selectedCell;
        const candidates = getCandidates(board, row, col);
        const hasUsedHintOnCell = activeHint && activeHint.row === row && activeHint.col === col;

        if (candidates.size === 1 || hasUsedHintOnCell) {
            placeNumberOnBoard(row, col, solution[row][col], true);
            hintActionTaken = true;
        } else if (candidates.size > 1) {
            clearAllHintEffects(); // Clear any other stray hint effects before setting the new one.
            setActiveHint({ row, col, level: 1 }); // Mark that a hint was used on this cell for the next time.
            
            const correctAnswer = solution[row][col];
            const incorrectNotes = Array.from(candidates).filter(n => n !== correctAnswer);
            const shuffled = incorrectNotes.sort(() => 0.5 - Math.random());
            const countToEliminate = Math.max(1, Math.ceil(shuffled.length / 2));
            const notesToEliminate = shuffled.slice(0, countToEliminate);
            
            const newBoard = deepCopyBoard(board);
            const cellToUpdate = newBoard[row][col];
            notesToEliminate.forEach(num => {
                cellToUpdate.eliminatedNotes.add(num);
                cellToUpdate.userNotes.delete(num);
                cellToUpdate.autoNotes.delete(num);
            });
            
            setHistory(prev => [...prev, board]);
            setBoard(newBoard);
            hintActionTaken = true;
        }
    } else {
      // Scenario 2: No valid cell is selected. Highlight the easiest cell to solve.
      let candidateCells: { row: number; col: number; size: number }[] = [];
      for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
              if (board[r][c].value === 0) {
                  const candidates = getCandidates(board, r, c);
                  if (candidates.size > 0) {
                      candidateCells.push({ row: r, col: c, size: candidates.size });
                  }
              }
          }
      }

      if (candidateCells.length > 0) {
        // Sort to find the cell with the fewest candidates.
        candidateCells.sort((a, b) => a.size - b.size);
        const minSize = candidateCells[0].size;
        const tiedCells = candidateCells.filter(cell => cell.size === minSize);
        
        let bestCell: { row: number, col: number };
        if (tiedCells.length === 1) {
            bestCell = tiedCells[0];
        } else {
            // Tie-breaker: find the cell in the most "filled" or constrained region.
            let maxScore = -1;
            let scoredCell: { row: number; col: number } | null = null;
            const gridValues = board.map(row => row.map(cell => cell.value));
            
            for (const cell of tiedCells) {
                let score = 0;
                const { row, col } = cell;
                for (let i = 0; i < 9; i++) { if (gridValues[row][i] !== 0) score++; }
                for (let i = 0; i < 9; i++) { if (gridValues[i][col] !== 0) score++; }
                const boxStartRow = Math.floor(row / 3) * 3;
                const boxStartCol = Math.floor(col / 3) * 3;
                for (let r = boxStartRow; r < boxStartRow + 3; r++) {
                    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                        if (gridValues[r][c] !== 0) score++;
                    }
                }
                if (score > maxScore) {
                    maxScore = score;
                    scoredCell = cell;
                }
            }
            bestCell = scoredCell!;
        }

        if (bestCell) {
            clearAllHintEffects();
            setHintTargetCell(bestCell);
            hintActionTaken = true;
        }
      }
    }

    if (hintActionTaken) {
      startCooldown();
      setHintUsageCount(prev => prev + 1);
    }
}, [board, isHintOnCooldown, selectedCell, isGameWon, solution, activeHint, placeNumberOnBoard, clearAllHintEffects, startCooldown]);


  const handleFillBoard = useCallback(() => {
    if (solution.length === 0) return;
    const solvedBoard = solution.map(row =>
      row.map(value => ({
        value,
        isInitial: false,
        isWrong: false,
        userNotes: new Set<number>(),
        autoNotes: new Set<number>(),
        eliminatedNotes: new Set<number>(),
      }))
    );
    setBoard(solvedBoard);
    triggerWinState();
  }, [solution, triggerWinState]);

  const handleFillBoardAndCloseSettings = () => {
    setIsSettingsOpen(false);
    setTimeout(() => {
      handleFillBoard();
    }, 300); 
  };
  
  const handleCloseSettings = (newDifficulty: Difficulty) => {
    setIsSettingsOpen(false);
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      localStorage.setItem('sudoku-difficulty', newDifficulty);
      startNewGame(newDifficulty);
    }
  };

  const handleSetAutoNotes = (enabled: boolean) => {
    setIsAutoNotesEnabled(enabled);

    const newBoard = deepCopyBoard(board);

    if (enabled) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c].value === 0 && newBoard[r][c].userNotes.size === 0) {
            newBoard[r][c].autoNotes = getCandidates(newBoard, r, c);
          } else {
            newBoard[r][c].autoNotes.clear();
          }
        }
      }
    } else {
      newBoard.forEach(row => row.forEach(cell => cell.autoNotes.clear()));
    }

    setHistory(prev => [...prev, board]);
    setBoard(newBoard);
  };
  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameWon || isSettingsOpen || isStatsOpen) return;

      if (!selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setSelectedCell({ row: 0, col: 0 });
        event.preventDefault();
        return;
      }
      
      if (!selectedCell) return;

      const { row, col } = selectedCell;

      switch (event.key) {
        case 'ArrowUp':
          setSelectedCell({ row: Math.max(0, row - 1), col });
          event.preventDefault();
          break;
        case 'ArrowDown':
          setSelectedCell({ row: Math.min(8, row + 1), col });
          event.preventDefault();
          break;
        case 'ArrowLeft':
          setSelectedCell({ row, col: Math.max(0, col - 1) });
          event.preventDefault();
          break;
        case 'ArrowRight':
          setSelectedCell({ row, col: Math.min(8, col + 1) });
          event.preventDefault();
          break;
        case 'Backspace':
        case 'Delete':
          handleDelete();
          event.preventDefault();
          break;
        case 'Escape':
          setSelectedCell(null);
          event.preventDefault();
          break;
        default:
          const num = parseInt(event.key, 10);
          if (!isNaN(num) && num >= 1 && num <= 9) {
            handleNumberClick(num);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, handleDelete, handleNumberClick, isGameWon, isSettingsOpen, isStatsOpen]);

  if (board.length === 0 || solution.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Generating Puzzle...</div>;
  }
  
  const isCellMutable = selectedCell ? !board[selectedCell.row][selectedCell.col].isInitial : false;

  const formatTime = (milliseconds: number) => {
    if (!milliseconds || milliseconds <= 0) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const elapsedTime = endTime > 0 ? endTime - startTime : 0;

  const highlightedNumber = selectedCell && board[selectedCell.row][selectedCell.col].value > 0
    ? board[selectedCell.row][selectedCell.col].value
    : null;
    
  const isUIBlocked = isSettingsOpen || isStatsOpen;

  return (
    <div className={`min-h-screen font-sans relative`} onClick={() => setSelectedCell(null)}>
       <Header 
          isDarkMode={isDarkMode} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onNewGame={() => startNewGame(difficulty)}
        />
      <div className={`min-h-screen flex flex-col items-center justify-center pt-24 sm:pt-32 pb-4 sm:pb-8 px-4`}>
        <main className={`w-full max-w-lg flex flex-col items-center gap-4 sm:gap-6 transition-all duration-300 ${isUIBlocked ? 'blur-sm pointer-events-none' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Sudoku Board Section */}
          <div className="relative w-full">
            {animationState !== 'idle' && (
              <VictoryScreen 
                message={victoryMessage}
                moves={movesCount}
                time={formatTime(elapsedTime)}
                mistakes={mistakesCount}
              />
            )}
            <SudokuBoard 
              board={board}
              solution={solution}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              isNotesMode={isNotesMode}
              isDarkMode={isDarkMode}
              forceDarkMode={isGameWon}
              isAutoNotesEnabled={isAutoNotesEnabled}
              isHighlightNotesEnabled={isHighlightNotesEnabled}
              highlightedNumber={highlightedNumber}
              hintTargetCell={hintTargetCell}
            />
          </div>
          
          {/* NumberPad Section */}
          <div className={`
              relative w-full
              transition-opacity duration-300 ease-in-out
              ${isGameWon ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}>
              <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? 'translate-y-8' : ''}`}>
                  <NumberPad onNumberClick={handleNumberClick} isNotesMode={isNotesMode} isDarkMode={isDarkMode} />
              </div>
          </div>
          
          {/* Controls and Play Again Section */}
          <div className="relative w-full" style={{minHeight: '80px'}}>
              <div className={`
                  absolute inset-0 flex flex-col items-center justify-center
                  transition-opacity duration-300 ease-in-out
                  ${isGameWon ? 'opacity-0 pointer-events-none' : 'opacity-100'}
              `}>
                  <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? '-translate-y-8' : ''}`}>
                      <Controls 
                          isNotesMode={isNotesMode}
                          onToggleNotesMode={handleToggleNotesMode}
                          onUndo={handleUndo}
                          canUndo={history.length > 0}
                          onHint={handleHint}
                          isHintOnCooldown={isHintOnCooldown}
                          cooldownDuration={hintCooldownDuration}
                          onDelete={handleDelete}
                          isDarkMode={isDarkMode}
                      />
                  </div>
              </div>

              <div className={`
                  absolute inset-0 flex items-center justify-center
                  transition-all duration-500 ease-in-out transform
                  ${isGameWon ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
              `} style={{transitionDelay: isGameWon ? '250ms' : '0ms'}}>
                  <div className="relative w-auto rounded-full p-1 shadow-lg bg-slate-800">
                      <button
                          onClick={() => startNewGame(difficulty)}
                          className="w-auto bg-slate-800 text-white font-bold py-4 px-16 rounded-full text-2xl hover:bg-slate-700/80 transition-colors transform active:scale-95 flex items-center justify-center"
                      >
                           <span className={`transition-opacity duration-300 ease-in-out ${isGameWon ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: isGameWon ? '400ms' : '0ms'}}>
                              Play Again
                          </span>
                      </button>
                  </div>
              </div>
          </div>
        </main>
      </div>
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        currentDifficulty={difficulty}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onFillBoard={handleFillBoardAndCloseSettings}
        isAutoNotesEnabled={isAutoNotesEnabled}
        onSetAutoNotes={handleSetAutoNotes}
        isHighlightNotesEnabled={isHighlightNotesEnabled}
        onSetHighlightNotes={setIsHighlightNotesEnabled}
      />
      <StatsPanel
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;