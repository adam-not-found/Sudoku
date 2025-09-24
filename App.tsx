/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { generateSudoku, Difficulty } from './services/sudokuGenerator';
import Header from './components/Header';
import SudokuBoard from './components/StartScreen'; // Overwritten to be the SudokuBoard component
import NumberPad from './components/AdjustmentPanel'; // Overwritten to be the NumberPad component
import Controls from './components/CropPanel'; // Overwritten to be the Controls component
import { CellData } from './components/FilterPanel'; // Overwritten to be the Cell component
import VictoryScreen from './components/VictoryScreen';
import SettingsPanel from './components/SettingsPanel';

type AnimationState = 'idle' | 'playing' | 'finished';

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

const deepCopyBoard = (board: CellData[][]): CellData[][] => {
  return board.map(row => 
    row.map(cell => ({
      ...cell,
      userNotes: new Set(cell.userNotes),
      autoNotes: new Set(cell.autoNotes),
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
  const [redoHistory, setRedoHistory] = useState<CellData[][][]>([]);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [isGameWon, setIsGameWon] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [victoryMessage, setVictoryMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    () => (localStorage.getItem('sudoku-difficulty') as Difficulty) || 'medium'
  );

  const [isAutoNotesEnabled, setIsAutoNotesEnabled] = useState(
    () => localStorage.getItem('sudoku-auto-notes') === 'true'
  );

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('sudoku-dark-mode');
    if (savedMode) return savedMode === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('sudoku-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sudoku-auto-notes', String(isAutoNotesEnabled));
  }, [isAutoNotesEnabled]);

  // State for game statistics
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  const triggerWinState = useCallback(() => {
    const randomMessage = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
    setVictoryMessage(randomMessage);
    setIsGameWon(true);
    setEndTime(Date.now());
    setSelectedCell(null);
  }, []);

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
  
  const startNewGame = useCallback((gameDifficulty: Difficulty) => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(gameDifficulty);
    setPuzzle(newPuzzle);
    setSolution(newSolution);

    let newBoard = newPuzzle.map(row =>
      row.map(value => ({
        value,
        isInitial: value !== 0,
        isWrong: false,
        userNotes: new Set<number>(),
        autoNotes: new Set<number>(),
      }))
    );

    if (isAutoNotesEnabled) {
      const gridValues = newBoard.map(row => row.map(cell => cell.value));
      for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
              if (newBoard[r][c].value === 0) {
                  const possibleNotes = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                  for (let i = 0; i < 9; i++) { if (gridValues[r][i] !== 0) possibleNotes.delete(gridValues[r][i]); }
                  for (let i = 0; i < 9; i++) { if (gridValues[i][c] !== 0) possibleNotes.delete(gridValues[i][c]); }
                  const boxStartRow = Math.floor(r / 3) * 3;
                  const boxStartCol = Math.floor(c / 3) * 3;
                  for (let i = boxStartRow; i < boxStartRow + 3; i++) {
                      for (let j = boxStartCol; j < boxStartCol + 3; j++) {
                          if (gridValues[i][j] !== 0) possibleNotes.delete(gridValues[i][j]);
                      }
                  }
                  newBoard[r][c].autoNotes = possibleNotes;
              }
          }
      }
    }

    setBoard(newBoard);
    setSelectedCell(null);
    setIsNotesMode(false);
    setHistory([]);
    setRedoHistory([]);
    setHintsRemaining(3);
    setIsGameWon(false);
    setAnimationState('idle');

    // Reset stats for new game
    setStartTime(Date.now());
    setEndTime(0);
    setMovesCount(0);
    setMistakesCount(0);
  }, [isAutoNotesEnabled]);

  useEffect(() => {
    // On first load, generate a board with the saved difficulty.
    // This runs only once on mount.
    startNewGame(difficulty);
  }, []);
  
  useEffect(() => {
    if (isGameWon) {
      setAnimationState('playing');
      const timer = setTimeout(() => {
        setAnimationState('finished');
      }, 1500); // Animation duration

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isGameWon]);


  const handleCellClick = (row: number, col: number) => {
    if (isGameWon) return;
    setSelectedCell({ row, col });
  };

  const handleNumberClick = useCallback((num: number) => {
    if (!selectedCell || isGameWon || solution.length === 0) return;

    const { row, col } = selectedCell;
    const currentBoard = deepCopyBoard(board);
    
    const cell = currentBoard[row][col];
    if (cell.isInitial) return;

    setHistory(prev => [...prev, board]);
    setRedoHistory([]);

    if (isNotesMode) {
      if (cell.userNotes.has(num)) {
        cell.userNotes.delete(num);
      } else {
        cell.userNotes.add(num);
      }
      cell.value = 0;
    } else {
      setMovesCount(prev => prev + 1);
      cell.value = num;
      cell.userNotes.clear();
      cell.autoNotes.clear();
      const isCorrect = solution[row][col] === num;
      cell.isWrong = !isCorrect;
      
      if (!isCorrect) {
        setMistakesCount(prev => prev + 1);
      }
      
      if (isCorrect) {
        // Auto-remove this number from notes in the same row, col, and box
        for (let c = 0; c < 9; c++) {
          currentBoard[row][c].userNotes.delete(num);
          currentBoard[row][c].autoNotes.delete(num);
        }
        for (let r = 0; r < 9; r++) {
          currentBoard[r][col].userNotes.delete(num);
          currentBoard[r][col].autoNotes.delete(num);
        }
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
          for (let c = boxStartCol; c < boxStartCol + 3; c++) {
            currentBoard[r][c].userNotes.delete(num);
            currentBoard[r][c].autoNotes.delete(num);
          }
        }
        
        if (checkWinCondition(currentBoard)) {
          triggerWinState();
        }
      }
    }
    setBoard(currentBoard);
  }, [board, isNotesMode, selectedCell, isGameWon, solution, checkWinCondition, triggerWinState]);
  
  const handleToggleNotesMode = useCallback(() => {
    if (isGameWon) return;
    setIsNotesMode(prev => !prev);
  }, [isGameWon]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isGameWon) return;
    const lastState = history[history.length - 1];
    setRedoHistory(prev => [...prev, board]);
    setBoard(lastState);
    setHistory(history.slice(0, -1));
  }, [board, history, isGameWon]);

  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0 || isGameWon) return;
    const nextState = redoHistory[redoHistory.length - 1];
    setHistory(prev => [...prev, board]);
    setBoard(nextState);
    setRedoHistory(redoHistory.slice(0, -1));
  }, [board, redoHistory, isGameWon]);

  const handleDelete = useCallback(() => {
    if (!selectedCell || isGameWon) return;

    const { row, col } = selectedCell;
    const cellToDelete = board[row][col];

    if (cellToDelete.isInitial) return;

    if (cellToDelete.value === 0 && cellToDelete.userNotes.size === 0 && cellToDelete.autoNotes.size === 0) {
      return;
    }

    setHistory(prev => [...prev, board]);
    setRedoHistory([]);

    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];
    cell.value = 0;
    cell.userNotes.clear();
    cell.autoNotes.clear();
    cell.isWrong = false;
    setBoard(newBoard);
  }, [board, selectedCell, isGameWon]);

  const handleHint = useCallback(() => {
    if (!selectedCell || hintsRemaining <= 0 || isGameWon || solution.length === 0) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];
    
    if (cell.isInitial || (cell.value !== 0 && cell.value === solution[row][col])) {
      return;
    }

    setHistory(prev => [...prev, board]);
    setRedoHistory([]);

    const correctValue = solution[row][col];
    const newBoard = deepCopyBoard(board);

    newBoard[row][col] = {
      value: correctValue,
      isInitial: false,
      isWrong: false,
      userNotes: new Set(),
      autoNotes: new Set(),
    };

    // Auto-remove this number from notes in the same row, col, and box
    for (let c = 0; c < 9; c++) { 
        newBoard[row][c].userNotes.delete(correctValue);
        newBoard[row][c].autoNotes.delete(correctValue);
     }
    for (let r = 0; r < 9; r++) { 
        newBoard[r][col].userNotes.delete(correctValue);
        newBoard[r][col].autoNotes.delete(correctValue);
    }
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
      for (let c = boxStartCol; c < boxStartCol + 3; c++) {
        newBoard[r][c].userNotes.delete(correctValue);
        newBoard[r][c].autoNotes.delete(correctValue);
      }
    }

    setBoard(newBoard);
    setHintsRemaining(prev => prev - 1);
    setSelectedCell(null);
    
    if (checkWinCondition(newBoard)) {
      triggerWinState();
    }
  }, [board, hintsRemaining, selectedCell, isGameWon, solution, checkWinCondition, triggerWinState]);

  const handleFillBoard = useCallback(() => {
    if (solution.length === 0) return;
    const solvedBoard = solution.map(row =>
      row.map(value => ({
        value,
        isInitial: false,
        isWrong: false,
        userNotes: new Set<number>(),
        autoNotes: new Set<number>(),
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
    setIsAutoNotesEnabled(enabled); // Update preference for future games

    const newBoard = deepCopyBoard(board);

    if (enabled) {
      // Calculate and apply auto notes to the current board state
      const gridValues = newBoard.map(row => row.map(cell => cell.value));
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c].value === 0) {
            const possibleNotes = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (let i = 0; i < 9; i++) { if (gridValues[r][i] !== 0) possibleNotes.delete(gridValues[r][i]); }
            for (let i = 0; i < 9; i++) { if (gridValues[i][c] !== 0) possibleNotes.delete(gridValues[i][c]); }
            const boxStartRow = Math.floor(r / 3) * 3;
            const boxStartCol = Math.floor(c / 3) * 3;
            for (let i = boxStartRow; i < boxStartRow + 3; i++) {
              for (let j = boxStartCol; j < boxStartCol + 3; j++) {
                if (gridValues[i][j] !== 0) possibleNotes.delete(gridValues[i][j]);
              }
            }
            newBoard[r][c].autoNotes = possibleNotes;
          }
        }
      }
    } else {
      // Clear all auto notes from the current board
      newBoard.forEach(row => {
        row.forEach(cell => {
          cell.autoNotes.clear();
        });
      });
    }

    setHistory(prev => [...prev, board]);
    setRedoHistory([]);
    setBoard(newBoard);
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameWon || isSettingsOpen) return;

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
  }, [selectedCell, handleDelete, handleNumberClick, isGameWon, isSettingsOpen]);

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
  const hintsUsed = 3 - hintsRemaining;

  const highlightedNumber = selectedCell && board[selectedCell.row][selectedCell.col].value > 0
    ? board[selectedCell.row][selectedCell.col].value
    : null;

  return (
    <div className={`min-h-screen font-sans relative`}>
       <Header 
          isDarkMode={isDarkMode} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      <div className={`min-h-screen flex items-center justify-center pt-24 pb-4 px-4`}>
        <main className={`w-full max-w-lg flex flex-col items-center transition-all duration-300 ${isSettingsOpen ? 'blur-sm pointer-events-none' : ''}`}>
          <div className="relative w-full">
            {animationState !== 'idle' && (
              <VictoryScreen 
                message={victoryMessage}
                moves={movesCount}
                time={formatTime(elapsedTime)}
                mistakes={mistakesCount}
                hintsUsed={hintsUsed}
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
              highlightedNumber={highlightedNumber}
            />
          </div>
          <div className="mt-6 w-full max-w-lg flex flex-col items-center gap-4">
              <div className="relative w-full" style={{minHeight: '160px'}}>
                  <div className={`
                      absolute inset-0 flex flex-col items-center justify-center gap-4
                      transition-opacity duration-300 ease-in-out
                      ${isGameWon ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                  `}>
                      <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? 'translate-y-8' : ''}`}>
                          <NumberPad onNumberClick={handleNumberClick} isNotesMode={isNotesMode} isDarkMode={isDarkMode} />
                      </div>
                      <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? '-translate-y-8' : ''}`}>
                          <Controls 
                              isNotesMode={isNotesMode}
                              onToggleNotesMode={handleToggleNotesMode}
                              onUndo={handleUndo}
                              canUndo={history.length > 0}
                              onRedo={handleRedo}
                              canRedo={redoHistory.length > 0}
                              onHint={handleHint}
                              hintsRemaining={hintsRemaining}
                              isCellMutable={isCellMutable}
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
      />
    </div>
  );
};

export default App;