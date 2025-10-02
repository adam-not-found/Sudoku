/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSudoku } from './services/sudokuGenerator.ts';
import { SudokuBoard } from './components/SudokuBoard.tsx';
import { NumberPad } from './components/NumberPad.tsx';
import { Controls } from './components/Controls.tsx';
import { Header } from './components/Header.tsx';
import { VictoryScreen } from './components/VictoryScreen.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { StatsPanel } from './components/StatsPanel.tsx';

// --- HINT LOGIC SERVICE ---
const getNotes = (board, row, col) => {
    const cell = board[row][col];
    if (cell.value !== 0) return new Set();
    const notes = new Set([...cell.userNotes, ...cell.autoNotes]);
    cell.eliminatedNotes.forEach(eliminated => notes.delete(eliminated));
    return notes;
};

const getUnitCells = (type, index) => {
    const cells = [];
    if (type === 'row') {
        for (let c = 0; c < 9; c++) cells.push({ row: index, col: c });
    } else if (type === 'col') {
        for (let r = 0; r < 9; r++) cells.push({ row: r, col: index });
    } else if (type === 'box') {
        const boxStartRow = Math.floor(index / 3) * 3;
        const boxStartCol = (index % 3) * 3;
        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                cells.push({ row: r, col: c });
            }
        }
    }
    return cells;
};

const findNakedSingle = (board, targetCell) => {
    const checkCell = (r, c) => {
        if (board[r][c].value === 0) {
            const notes = getNotes(board, r, c);
            if (notes.size === 1) {
                const num = notes.values().next().value;
                return {
                    type: 'Naked Single',
                    primaryCells: [{ row: r, col: c }],
                    secondaryCells: [],
                    eliminations: [],
                    solve: { row: r, col: c, num },
                };
            }
        }
        return null;
    }
    if (targetCell) return checkCell(targetCell.row, targetCell.col);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const hint = checkCell(r, c);
            if (hint) return hint;
        }
    }
    return null;
};

const findNakedPair = (board, targetCell) => {
    const units = [];
    if (targetCell) {
        const boxIndex = Math.floor(targetCell.row / 3) * 3 + Math.floor(targetCell.col / 3);
        units.push(getUnitCells('row', targetCell.row));
        units.push(getUnitCells('col', targetCell.col));
        units.push(getUnitCells('box', boxIndex));
    } else {
        for(let i=0; i<9; i++) {
            units.push(getUnitCells('row', i));
            units.push(getUnitCells('col', i));
            units.push(getUnitCells('box', i));
        }
    }

    for (const unit of units) {
        const cellsWithTwoNotes = unit.filter(cell => getNotes(board, cell.row, cell.col).size === 2);
        if (cellsWithTwoNotes.length < 2) continue;

        for (let i = 0; i < cellsWithTwoNotes.length; i++) {
            for (let j = i + 1; j < cellsWithTwoNotes.length; j++) {
                const cell1 = cellsWithTwoNotes[i];
                const cell2 = cellsWithTwoNotes[j];
                const notes1 = getNotes(board, cell1.row, cell1.col);
                const notes2 = getNotes(board, cell2.row, cell2.col);
                const notes1Arr = [...notes1].sort();
                const notes2Arr = [...notes2].sort();

                if (notes1Arr[0] === notes2Arr[0] && notes1Arr[1] === notes2Arr[1]) {
                    const pairNums = notes1Arr;
                    const primaryCells = [cell1, cell2];
                    const eliminations = [];
                    const secondaryCells = [];

                    for (const unitCell of unit) {
                        if (primaryCells.some(pc => pc.row === unitCell.row && pc.col === unitCell.col)) continue;
                        
                        const unitCellNotes = getNotes(board, unitCell.row, unitCell.col);
                        let madeElimination = false;
                        if (unitCellNotes.has(pairNums[0])) {
                            eliminations.push({ row: unitCell.row, col: unitCell.col, num: pairNums[0] });
                            madeElimination = true;
                        }
                        if (unitCellNotes.has(pairNums[1])) {
                            eliminations.push({ row: unitCell.row, col: unitCell.col, num: pairNums[1] });
                            madeElimination = true;
                        }
                        if (madeElimination && !secondaryCells.some(sc => sc.row === unitCell.row && sc.col === unitCell.col)) {
                            secondaryCells.push(unitCell);
                        }
                    }

                    if (eliminations.length > 0) {
                        if (targetCell && !primaryCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                        
                        return {
                            type: 'Naked Pair',
                            primaryCells,
                            secondaryCells,
                            eliminations,
                            solve: null,
                        };
                    }
                }
            }
        }
    }
    return null;
}

const findHint = (board, difficulty, targetCell) => {
    let hint = findNakedSingle(board, targetCell);
    if (hint) return hint;
    
    if (difficulty === 'hard' || difficulty === 'professional') {
        hint = findNakedPair(board, targetCell);
        if (hint) return hint;
    }

    return null;
};
// --- END HINT LOGIC SERVICE ---

const initialStats = {
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
  "Perfectly solved, as all grids should be.", "This solve was... inevitable.", "Numbers... Assemble.", "That's my secret: I'm always thinking.", "Dread it. Run from it. The numbers arrive all the same.", "The Logic is strong with this one.", "This is the way.", "These are the digits you're looking for.", "We will watch your career with great interest.", "I find your lack of empty cells... pleasing.", "True Jedi.", "Never tell me the odds!", "It's over, puzzle. I have the high ground.", "One grid to rule them all.", "My precious... solution.", "Not all those who ponder are lost.", "Looks like victory is back on the menu.", "One does not simply solve this grid... but you did.", "Mischief Managed.", "You're a wizard, solver.", "10 points for that solve!", "He who controls the numbers controls the grid.", "That's got to be the best solver I've ever seen.", "Pencils? Where we're going, we don't need pencils.", "Houston, we have a solution.", "Are you not entertained?!", "This puzzle has been terminated.", "Calculated.", "What a solve!", "This is Sudoku!", "Steeeerike!", "Home Run!", "Nice shot!", "The numbers, Mason! I figured them out!", "All your boxes are belong to us.",
];

const SAVED_GAME_KEY = 'sudoku-saved-game';
const SUDOKU_STATS_KEY = 'sudoku-stats';

const serializeSets = (key, value) => {
  if (value instanceof Set) {
    return { __dataType: 'Set', value: [...value] };
  }
  return value;
};

const deserializeSets = (key, value) => {
  if (typeof value === 'object' && value !== null && value.__dataType === 'Set') {
    return new Set(value.value);
  }
  return value;
};

const deepCopyBoard = (board) => {
  return board.map(row => 
    row.map(cell => ({
      ...cell,
      userNotes: new Set(cell.userNotes),
      autoNotes: new Set(cell.autoNotes),
      eliminatedNotes: new Set(cell.eliminatedNotes),
    }))
  );
};

export const App = () => {
  const [board, setBoard] = useState([]);
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [victoryMessage, setVictoryMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(
    () => (localStorage.getItem('sudoku-difficulty')) || 'medium'
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
  const [stats, setStats] = useState(() => {
    try {
      const savedStats = localStorage.getItem(SUDOKU_STATS_KEY);
      return savedStats ? JSON.parse(savedStats) : initialStats;
    } catch (e) {
      console.error("Error loading stats:", e);
      return initialStats;
    }
  });
  const [activeHint, setActiveHint] = useState(null);
  const [isHintOnCooldown, setIsHintOnCooldown] = useState(false);
  const [hintUsageCount, setHintUsageCount] = useState(0);
  const [hintCooldownDuration, setHintCooldownDuration] = useState(4);
  const [hintEffect, setHintEffect] = useState(null);
  const cooldownIntervalRef = useRef(null);

  useEffect(() => {
    if (hintEffect) {
        const timer = setTimeout(() => setHintEffect(null), 800);
        return () => clearTimeout(timer);
    }
  }, [hintEffect]);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    const currentDuration = 4; // Fixed 4 seconds for testing
    setHintCooldownDuration(currentDuration);
    setIsHintOnCooldown(true);
    let timer = currentDuration;
    cooldownIntervalRef.current = window.setInterval(() => {
      timer -= 1;
      if (timer <= 0) {
        clearInterval(cooldownIntervalRef.current);
        setIsHintOnCooldown(false);
      }
    }, 1000);
  }, []);

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

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  
  const clearAllHintEffects = useCallback(() => {
    setActiveHint(null);
  }, []);

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
    localStorage.removeItem(SAVED_GAME_KEY);
  }, [clearAllHintEffects, startTime, difficulty, movesCount, mistakesCount]);

  const checkWinCondition = useCallback((currentBoard) => {
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

  const startNewGame = useCallback((gameDifficulty) => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(gameDifficulty);
    
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    setPuzzle(newPuzzle);
    setSolution(newSolution);

    let newBoard = newPuzzle.map(row =>
      row.map(value => ({
        value, isInitial: value !== 0, isWrong: false,
        userNotes: new Set(), autoNotes: new Set(), eliminatedNotes: new Set(),
      }))
    );

    if (isAutoNotesEnabled) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c].value === 0) {
            newBoard[r][c].autoNotes = getNotes(newBoard, r, c);
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
    
    setIsHintOnCooldown(false);
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    setHintUsageCount(0);

    setStartTime(Date.now());
    setEndTime(0);
    setMovesCount(0);
    setMistakesCount(0);
  }, [isAutoNotesEnabled, clearAllHintEffects]);

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
        if (savedGame.difficulty && savedGame.difficulty !== difficulty) {
            setDifficulty(savedGame.difficulty);
            localStorage.setItem('sudoku-difficulty', savedGame.difficulty);
        }
      } catch (e) {
        console.error("Error loading saved game:", e);
        localStorage.removeItem(SAVED_GAME_KEY);
        startNewGame(difficulty);
      }
    } else {
      startNewGame(difficulty);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (board.length === 0 || isGameWon) return;
    const gameState = { board, puzzle, solution, history, startTime, movesCount, mistakesCount, difficulty, hintUsageCount };
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(gameState, serializeSets));
  }, [board, puzzle, solution, history, startTime, movesCount, mistakesCount, difficulty, isGameWon, hintUsageCount]);
  
  useEffect(() => {
    if (isGameWon) {
      setAnimationState('playing');
      const timer = setTimeout(() => setAnimationState('finished'), 1500);
      return () => clearTimeout(timer);
    }
  }, [isGameWon]);

  const handleCellClick = (row, col) => {
    if (isGameWon) return;
    if (activeHint) {
      clearAllHintEffects();
    }
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ row, col });
    }
  };

  const placeNumberOnBoard = useCallback((row, col, num, isFromHint = false) => {
    setHistory(prev => [...prev, board]);
    clearAllHintEffects();
    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];
    if (!isFromHint) setMovesCount(prev => prev + 1);
    cell.value = num;
    cell.userNotes.clear(); cell.autoNotes.clear(); cell.eliminatedNotes.clear();
    const isCorrect = solution[row][col] === num;
    cell.isWrong = !isCorrect;
    if (!isCorrect && !isFromHint) setMistakesCount(prev => prev + 1);
    if (isCorrect) {
        if (!isFromHint) {
            setSelectedCell(null);
        }
        for (let c = 0; c < 9; c++) { newBoard[row][c].userNotes.delete(num); newBoard[row][c].autoNotes.delete(num); }
        for (let r = 0; r < 9; r++) { newBoard[r][col].userNotes.delete(num); newBoard[r][col].autoNotes.delete(num); }
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                newBoard[r][c].userNotes.delete(num); newBoard[r][c].autoNotes.delete(num);
            }
        }
        if (checkWinCondition(newBoard)) triggerWinState();
    }
    setBoard(newBoard);
  }, [board, solution, clearAllHintEffects, checkWinCondition, triggerWinState]);

  const handleNumberClick = useCallback((num) => {
    if (!selectedCell || isGameWon || solution.length === 0) return;
    const { row, col } = selectedCell;
    const cellData = board[row][col];
    if (cellData.isInitial) return;
    if (isNotesMode) {
        if (cellData.eliminatedNotes.has(num)) return;
        if (!cellData.eliminatedNotes.has(num)) {
            setHistory(prev => [...prev, board]);
            clearAllHintEffects();
            const newBoard = deepCopyBoard(board);
            const cell = newBoard[row][col];
            const isAdding = !cell.userNotes.has(num) && !cell.autoNotes.has(num);
            if (isAdding) cell.userNotes.add(num);
            else { cell.userNotes.delete(num); cell.autoNotes.delete(num); }
            cell.value = 0;
            setBoard(newBoard);
        }
    } else {
        placeNumberOnBoard(row, col, num);
    }
  }, [board, isNotesMode, selectedCell, isGameWon, solution, clearAllHintEffects, placeNumberOnBoard]);
  
  const handleToggleNotesMode = useCallback(() => { if (!isGameWon) setIsNotesMode(prev => !prev); }, [isGameWon]);
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isGameWon) return;
    setBoard(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    clearAllHintEffects();
  }, [history, isGameWon, clearAllHintEffects]);

  const handleDelete = useCallback(() => {
    if (!selectedCell || isGameWon) return;
    const { row, col } = selectedCell;
    const cellToDelete = board[row][col];
    if (cellToDelete.isInitial || (cellToDelete.value === 0 && cellToDelete.userNotes.size === 0 && cellToDelete.autoNotes.size === 0 && cellToDelete.eliminatedNotes.size === 0)) return;
    setHistory(prev => [...prev, board]);
    clearAllHintEffects();
    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];
    cell.value = 0;
    cell.userNotes.clear(); cell.autoNotes.clear(); cell.eliminatedNotes.clear();
    cell.isWrong = false;
    setBoard(newBoard);
  }, [board, selectedCell, isGameWon, clearAllHintEffects]);

  const handleHint = useCallback(() => {
    if (isHintOnCooldown || isGameWon || solution.length === 0) return;

    // Second click logic: If a hint is already active, apply its action
    if (activeHint) {
        if (activeHint.solve) {
            const { row, col, num } = activeHint.solve;
            placeNumberOnBoard(row, col, num, true);
        } else if (activeHint.eliminations?.length > 0) {
            setHistory(prev => [...prev, board]);
            const newBoard = deepCopyBoard(board);
            activeHint.eliminations.forEach(({ row, col, num }) => {
                const cellToUpdate = newBoard[row][col];
                cellToUpdate.eliminatedNotes.add(num);
                cellToUpdate.userNotes.delete(num);
                cellToUpdate.autoNotes.delete(num);
            });
            setBoard(newBoard);
            setHintEffect({ type: 'note-pop', eliminations: activeHint.eliminations });
        }
        clearAllHintEffects();
        return; // Action taken, so we exit
    }

    // First click logic: Find a new hint
    const hint = findHint(board, difficulty, selectedCell);

    if (hint) {
        setActiveHint(hint);
        if (hint.primaryCells.length > 0) {
            // Use cell-glow for single-cell hints for a more focused effect
            if (hint.primaryCells.length === 1) {
                setHintEffect({ type: 'cell-glow', cell: hint.primaryCells[0] });
            }
        }
        startCooldown();
        setHintUsageCount(prev => prev + 1);
    }
  }, [board, isHintOnCooldown, selectedCell, isGameWon, solution, activeHint, difficulty, placeNumberOnBoard, clearAllHintEffects, startCooldown]);

  const handleFillBoard = useCallback(() => {
    if (solution.length === 0) return;
    const solvedBoard = solution.map(row => row.map(value => ({
      value, isInitial: false, isWrong: false,
      userNotes: new Set(), autoNotes: new Set(), eliminatedNotes: new Set(),
    })));
    setBoard(solvedBoard);
    triggerWinState();
  }, [solution, triggerWinState]);

  const handleFillBoardAndCloseSettings = () => {
    setIsSettingsOpen(false);
    setTimeout(() => handleFillBoard(), 300); 
  };
  
  const handleCloseSettings = (newDifficulty) => {
    setIsSettingsOpen(false);
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      localStorage.setItem('sudoku-difficulty', newDifficulty);
      startNewGame(newDifficulty);
    }
  };

  const handleSetAutoNotes = (enabled) => {
    setIsAutoNotesEnabled(enabled);
    const newBoard = deepCopyBoard(board);
    if (enabled) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c].value === 0 && newBoard[r][c].userNotes.size === 0) {
            newBoard[r][c].autoNotes = getNotes(newBoard, r, c);
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
    const handleKeyDown = (event) => {
      if (isGameWon || isSettingsOpen || isStatsOpen) return;
      if (!selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setSelectedCell({ row: 0, col: 0 });
        event.preventDefault();
        return;
      }
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      switch (event.key) {
        case 'ArrowUp': setSelectedCell({ row: Math.max(0, row - 1), col }); event.preventDefault(); break;
        case 'ArrowDown': setSelectedCell({ row: Math.min(8, row + 1), col }); event.preventDefault(); break;
        case 'ArrowLeft': setSelectedCell({ row, col: Math.max(0, col - 1) }); event.preventDefault(); break;
        case 'ArrowRight': setSelectedCell({ row, col: Math.min(8, col + 1) }); event.preventDefault(); break;
        case 'Backspace': case 'Delete': handleDelete(); event.preventDefault(); break;
        case 'Escape': setSelectedCell(null); event.preventDefault(); break;
        default:
          const num = parseInt(event.key, 10);
          if (!isNaN(num) && num >= 1 && num <= 9) handleNumberClick(num);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleDelete, handleNumberClick, isGameWon, isSettingsOpen, isStatsOpen]);

  if (board.length === 0 || solution.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Generating Puzzle...</div>;
  }
  
  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const elapsedTime = endTime > 0 ? endTime - startTime : 0;
  const highlightedNumber = selectedCell && board[selectedCell.row][selectedCell.col].value > 0
    ? board[selectedCell.row][selectedCell.col].value : null;
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
        <main className={`w-full max-w-lg flex flex-col items-center gap-4 sm:gap-6 transition-all duration-300 ${isUIBlocked ? 'blur-sm pointer-events-none' : ''}`}>
          <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
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
              activeHint={activeHint}
              hintEffect={hintEffect}
            />
          </div>
          <div className="relative w-full flex flex-col items-center gap-2">
              <div className={`w-full transition-opacity duration-300 ease-in-out ${isGameWon ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={(e) => e.stopPropagation()}>
                  <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? 'translate-y-8' : ''}`}>
                      <NumberPad onNumberClick={handleNumberClick} isNotesMode={isNotesMode} isDarkMode={isDarkMode} />
                  </div>
              </div>
              <div className="relative w-full flex justify-center" style={{minHeight: '80px'}}>
                  <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out ${isGameWon ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                      <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? '-translate-y-8' : ''}`} onClick={(e) => e.stopPropagation()}>
                          <Controls 
                              isNotesMode={isNotesMode} onToggleNotesMode={handleToggleNotesMode} onUndo={handleUndo}
                              canUndo={history.length > 0} onHint={handleHint} isHintOnCooldown={isHintOnCooldown}
                              cooldownDuration={hintCooldownDuration} onDelete={handleDelete} isDarkMode={isDarkMode}
                          />
                      </div>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out transform ${isGameWon ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} style={{transitionDelay: isGameWon ? '250ms' : '0ms'}}>
                      <div className="relative w-auto rounded-full p-1 shadow-lg bg-slate-800" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </main>
      </div>
      <SettingsPanel
        isOpen={isSettingsOpen} onClose={handleCloseSettings} currentDifficulty={difficulty}
        isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onFillBoard={handleFillBoardAndCloseSettings} isAutoNotesEnabled={isAutoNotesEnabled}
        onSetAutoNotes={handleSetAutoNotes} isHighlightNotesEnabled={isHighlightNotesEnabled}
        onSetHighlightNotes={setIsHighlightNotesEnabled}
      />
      <StatsPanel isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} stats={stats} isDarkMode={isDarkMode} />
    </div>
  );
};