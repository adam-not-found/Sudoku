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

  const [isHighlightNotesEnabled, setIsHighlightNotesEnabled] = useState(
    () => localStorage.getItem('sudoku-highlight-notes') === 'true'
  );

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('sudoku-dark-mode');
    if (savedMode) return savedMode === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // State for hint visuals and logic
  const [hintTargetCell, setHintTargetCell] = useState<{row: number, col: number} | null>(null);
  const [activeHint, setActiveHint] = useState<{row: number, col: number, level: number} | null>(null);


  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('sudoku-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sudoku-auto-notes', String(isAutoNotesEnabled));
  }, [isAutoNotesEnabled]);

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
    setVictoryMessage(randomMessage);
    setIsGameWon(true);
    setEndTime(Date.now());
    setSelectedCell(null);
    clearAllHintEffects();
  }, [clearAllHintEffects]);

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
    setRedoHistory([]);
    setHintsRemaining(3);
    setIsGameWon(false);
    setAnimationState('idle');
    clearAllHintEffects();

    // Reset stats for new game
    setStartTime(Date.now());
    setEndTime(0);
    setMovesCount(0);
    setMistakesCount(0);
  }, [isAutoNotesEnabled, clearAllHintEffects]);

  useEffect(() => {
    startNewGame(difficulty);
  }, []);
  
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
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ row, col });
    }
    clearAllHintEffects();
  };

  const handleNumberClick = useCallback((num: number, isFromHint: boolean = false) => {
    if (!selectedCell || isGameWon || solution.length === 0) return;

    const { row, col } = selectedCell;
    const cellData = board[row][col];
    if (cellData.isInitial) return;

    if (isNotesMode && !isFromHint) {
        if (cellData.eliminatedNotes.has(num)) {
            return; // Cannot interact with red "eliminated" notes
        }
        
        const willChange = !cellData.eliminatedNotes.has(num);
        if (!willChange) return;

        setHistory(prev => [...prev, board]);
        setRedoHistory([]);
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
        setHistory(prev => [...prev, board]);
        setRedoHistory([]);
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
    }
  }, [board, isNotesMode, selectedCell, isGameWon, solution, checkWinCondition, triggerWinState, clearAllHintEffects]);
  
  const handleToggleNotesMode = useCallback(() => {
    if (isGameWon) return;
    setIsNotesMode(prev => !prev);
    clearAllHintEffects();
  }, [isGameWon, clearAllHintEffects]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isGameWon) return;
    const lastState = history[history.length - 1];
    setRedoHistory(prev => [...prev, board]);
    setBoard(lastState);
    setHistory(history.slice(0, -1));
    clearAllHintEffects();
  }, [board, history, isGameWon, clearAllHintEffects]);

  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0 || isGameWon) return;
    const nextState = redoHistory[redoHistory.length - 1];
    setHistory(prev => [...prev, board]);
    setBoard(nextState);
    setRedoHistory(redoHistory.slice(0, -1));
    clearAllHintEffects();
  }, [board, redoHistory, isGameWon, clearAllHintEffects]);

  const handleDelete = useCallback(() => {
    if (!selectedCell || isGameWon) return;

    const { row, col } = selectedCell;
    const cellToDelete = board[row][col];

    if (cellToDelete.isInitial) return;

    if (cellToDelete.value === 0 && cellToDelete.userNotes.size === 0 && cellToDelete.autoNotes.size === 0 && cellToDelete.eliminatedNotes.size === 0) {
      return;
    }

    setHistory(prev => [...prev, board]);
    setRedoHistory([]);
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
    if (hintsRemaining <= 0 || isGameWon || solution.length === 0) return;

    clearHintHighlights();

    const isHintableCellSelected = selectedCell && !board[selectedCell.row][selectedCell.col].isInitial && board[selectedCell.row][selectedCell.col].value === 0;

    // Case 1: A valid cell is selected -> Progressive Hint
    if (isHintableCellSelected) {
        const { row, col } = selectedCell;
        let nextLevel = 1;

        if (activeHint && activeHint.row === row && activeHint.col === col) {
            nextLevel = activeHint.level + 1;
        } else {
            setHintsRemaining(prev => prev - 1);
        }

        setActiveHint({ row, col, level: nextLevel });

        switch (nextLevel) {
            case 1: { // Candidate Elimination
                clearHintHighlights();
                const correctAnswer = solution[row][col];
                const cellForNotes = board[row][col];
                const existingNotes = cellForNotes.userNotes.size > 0 ? cellForNotes.userNotes : cellForNotes.autoNotes;

                let incorrectNotesToShow: number[] = [];

                if (existingNotes.size > 0) {
                    const incorrectNotesInCell = Array.from(existingNotes).filter(n => n !== correctAnswer);
                    const shuffled = incorrectNotesInCell.sort(() => 0.5 - Math.random());
                    const countToHighlight = Math.max(1, Math.ceil(shuffled.length / 2));
                    incorrectNotesToShow = shuffled.slice(0, countToHighlight);
                } else {
                    const candidates = getCandidates(board, row, col);
                    candidates.delete(correctAnswer);
                    incorrectNotesToShow = Array.from(candidates).slice(0, 3);
                }
                
                const newBoard = deepCopyBoard(board);
                const cellToUpdate = newBoard[row][col];
                
                incorrectNotesToShow.forEach(num => {
                    cellToUpdate.eliminatedNotes.add(num);
                    cellToUpdate.userNotes.delete(num);
                    cellToUpdate.autoNotes.delete(num);
                });
                
                setHistory(prev => [...prev, board]);
                setRedoHistory([]);
                setBoard(newBoard);
                return;
            }
            
            case 2: // The Answer
            default:
                handleNumberClick(solution[row][col], true);
                clearAllHintEffects();
                setActiveHint(null);
                return;
        }
    }


    // Case 2: No cell selected or cell not hintable -> "Smart Nudge"
    let candidateCells: { row: number; col: number }[] = [];
    let minCandidates = 10;
    const gridValues = board.map(row => row.map(cell => cell.value));

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (gridValues[r][c] === 0) {
                const candidates = getCandidates(board, r, c);
                if (candidates.size > 0) {
                    if (candidates.size < minCandidates) {
                        minCandidates = candidates.size;
                        candidateCells = [{ row: r, col: c }];
                    } else if (candidates.size === minCandidates) {
                        candidateCells.push({ row: r, col: c });
                    }
                }
            }
        }
    }

    let bestCell: { row: number; col: number } | null = null;
    if (candidateCells.length === 1) {
        bestCell = candidateCells[0];
    } else if (candidateCells.length > 1) {
        let maxScore = -1;
        for (const cell of candidateCells) {
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
                bestCell = cell;
            }
        }
    }

    if (bestCell) {
        setHintTargetCell(bestCell);
        if (!isHintableCellSelected) {
             setHintsRemaining(prev => prev - 1);
        }
        setActiveHint(null);
        setTimeout(clearHintHighlights, 2000);
    }
}, [board, hintsRemaining, selectedCell, isGameWon, solution, activeHint, handleNumberClick, clearHintHighlights, clearAllHintEffects]);


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
    setRedoHistory([]);
    setBoard(newBoard);
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameWon || isSettingsOpen) return;
      clearAllHintEffects();

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
  }, [selectedCell, handleDelete, handleNumberClick, isGameWon, isSettingsOpen, clearAllHintEffects]);

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
    <div className={`min-h-screen font-sans relative`} onClick={() => setSelectedCell(null)}>
       <Header 
          isDarkMode={isDarkMode} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewGame={() => startNewGame(difficulty)}
        />
      <div className={`min-h-screen flex items-center justify-center pt-24 pb-4 px-4`}>
        <main className={`w-full max-w-lg flex flex-col items-center transition-all duration-300 ${isSettingsOpen ? 'blur-sm pointer-events-none' : ''}`} onClick={(e) => e.stopPropagation()}>
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
              isHighlightNotesEnabled={isHighlightNotesEnabled}
              highlightedNumber={highlightedNumber}
              hintTargetCell={hintTargetCell}
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
        isHighlightNotesEnabled={isHighlightNotesEnabled}
        onSetHighlightNotes={setIsHighlightNotesEnabled}
      />
    </div>
  );
};

export default App;