import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSudoku } from './services/sudokuGenerator';
import { calculateCandidates, findHint } from './services/hintService';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Controls from './components/Controls';
import Header from './components/Header';
import VictoryScreen from './components/VictoryScreen';
import SettingsPanel from './components/SettingsPanel';
import StatsPanel from './components/StatsPanel';

export default function App() {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [victoryMessage, setVictoryMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('sudoku-difficulty') || 'medium');
  const [isAutoNotesEnabled, setIsAutoNotesEnabled] = useState(() => localStorage.getItem('sudoku-auto-notes') === 'true');
  const [isHighlightNotesEnabled, setIsHighlightNotesEnabled] = useState(() => localStorage.getItem('sudoku-highlight-notes') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sudoku-dark-mode');
    return saved ? saved === 'true' : window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const [stats, setStats] = useState(() => { try { return JSON.parse(localStorage.getItem('sudoku-stats')) || {gamesPlayed:0,gamesWon:0,totalMoves:0,totalMistakes:0,byDifficulty:{easy:{wins:0,bestTime:null,totalTime:0},medium:{wins:0,bestTime:null,totalTime:0},hard:{wins:0,bestTime:null,totalTime:0},professional:{wins:0,bestTime:null,totalTime:0}}}; } catch (e) { return {gamesPlayed:0,gamesWon:0,totalMoves:0,totalMistakes:0,byDifficulty:{easy:{wins:0,bestTime:null,totalTime:0},medium:{wins:0,bestTime:null,totalTime:0},hard:{wins:0,bestTime:null,totalTime:0},professional:{wins:0,bestTime:null,totalTime:0}}}; }});
  const [activeHint, setActiveHint] = useState(null);
  const [isHintOnCooldown, setIsHintOnCooldown] = useState(false);
  const [hintUsageCount, setHintUsageCount] = useState(0);
  const [hintEffect, setHintEffect] = useState(null);
  const [hintButtonEffect, setHintButtonEffect] = useState(null);
  const cooldownIntervalRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isTimerVisible, setIsTimerVisible] = useState(() => localStorage.getItem('sudoku-timer-visible') === 'true');
  const [highlightedNumPad, setHighlightedNumPad] = useState(null);

  const isUIBlocked = isSettingsOpen || isStatsOpen;

  const startCooldown = useCallback(() => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    setIsHintOnCooldown(true);
    cooldownIntervalRef.current = setTimeout(() => setIsHintOnCooldown(false), 4000);
  }, []);

  const formatTime = (ms) => `${Math.floor(ms/60000)}:${(Math.floor(ms/1000)%60).toString().padStart(2,'0')}`;
  
  const triggerWinState = useCallback(() => {
    setIsTimerRunning(false);
    const msgs = ["Perfectly solved.", "This solve was... inevitable.", "Numbers... Assemble.", "That's my secret: I'm always thinking.", "The Logic is strong with this one.", "This is the way.", "We will watch your career with great interest.", "True Jedi.", "Never tell me the odds!", "My precious... solution.", "One does not simply solve this grid... but you did.", "Mischief Managed.", "You're a wizard, solver.", "10 points for that solve!", "Houston, we have a solution.", "Are you not entertained?!", "This puzzle has been terminated.", "What a solve!", "This is Sudoku!"];
    const gameDuration = elapsedTime;
    setStats(prev => {
      const diffStats = prev.byDifficulty[difficulty];
      const best = diffStats.bestTime === null || gameDuration < diffStats.bestTime ? gameDuration : diffStats.bestTime;
      return {...prev, gamesWon: prev.gamesWon+1, totalMoves: prev.totalMoves+movesCount, totalMistakes: prev.totalMistakes+mistakesCount, byDifficulty: {...prev.byDifficulty, [difficulty]: { wins: diffStats.wins+1, bestTime: best, totalTime: diffStats.totalTime+gameDuration }}};
    });
    setVictoryMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setIsGameWon(true);
    setSelectedCell(null);
    setActiveHint(null);
    localStorage.removeItem('sudoku-saved-game');
  }, [elapsedTime, difficulty, movesCount, mistakesCount]);

  const checkWinCondition = useCallback((board) => {
    if (solution.length === 0) return false;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (board[r][c].value === 0 || board[r][c].value !== solution[r][c]) return false;
    return true;
  }, [solution]);

  const startNewGame = useCallback((gameDifficulty) => {
    setBoard([]); // Show loading screen
    
    // Defer the heavy computation
    setTimeout(() => {
        const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(gameDifficulty);
        setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
        setSolution(newSolution);
        
        let newBoard = newPuzzle.map(row => row.map(value => ({ value, isInitial: value !== 0, isWrong: false, userNotes: new Set(), autoNotes: new Set(), eliminatedNotes: new Set() })));
        
        if (isAutoNotesEnabled) {
          for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (newBoard[r][c].value === 0) newBoard[r][c].autoNotes = calculateCandidates(newBoard, r, c);
        }
        
        setBoard(newBoard);
        setSelectedCell(null);
        setHighlightedNumPad(null);
        setIsNotesMode(false);
        setHistory([]);
        setRedoHistory([]);
        setIsGameWon(false);
        setAnimationState('idle');
        setActiveHint(null);
        setHintEffect(null);
        setHintButtonEffect(null);
        setIsHintOnCooldown(false);
        if (cooldownIntervalRef.current) clearTimeout(cooldownIntervalRef.current);
        setHintUsageCount(0);
        setElapsedTime(0);
        setIsTimerRunning(true);
        setMovesCount(0);
        setMistakesCount(0);
    }, 10);
  }, [isAutoNotesEnabled]);
  
  const deepCopyBoard = (board) => board.map(r => r.map(c => ({...c, userNotes: new Set(c.userNotes), autoNotes: new Set(c.autoNotes), eliminatedNotes: new Set(c.eliminatedNotes)})));
  
  const placeNumberOnBoard = useCallback((row, col, num, isFromHint = false) => {
    setHistory(prev => [...prev, board]);
    setRedoHistory([]);
    setActiveHint(null);
    const newBoard = deepCopyBoard(board);
    const cell = newBoard[row][col];
    if (!isFromHint) setMovesCount(prev => prev + 1);
    cell.value = num;
    cell.userNotes.clear(); cell.autoNotes.clear(); cell.eliminatedNotes.clear();
    const isCorrect = solution[row][col] === num;
    cell.isWrong = !isCorrect;
    if (!isCorrect && !isFromHint) setMistakesCount(prev => prev + 1);
    if (isCorrect) {
        if (!isFromHint) setSelectedCell(null);
        for (let c = 0; c < 9; c++) { newBoard[row][c].userNotes.delete(num); newBoard[row][c].autoNotes.delete(num); }
        for (let r = 0; r < 9; r++) { newBoard[r][col].userNotes.delete(num); newBoard[r][col].autoNotes.delete(num); }
        const boxR = Math.floor(row / 3) * 3, boxC = Math.floor(col / 3) * 3;
        for (let r = boxR; r < boxR + 3; r++) for (let c = boxC; c < boxC + 3; c++) { newBoard[r][c].userNotes.delete(num); newBoard[r][c].autoNotes.delete(num); }
        if (checkWinCondition(newBoard)) triggerWinState();
    }
    setBoard(newBoard);
  }, [board, solution, checkWinCondition, triggerWinState]);

  const handleNumberClick = useCallback((num) => {
    if (!selectedCell || isGameWon || solution.length === 0 || board[selectedCell.row][selectedCell.col].isInitial) return;
    const { row, col } = selectedCell;
    if (isNotesMode) {
        setHistory(prev => [...prev, board]);
        setRedoHistory([]);
        setActiveHint(null);
        const newBoard = deepCopyBoard(board);
        const cell = newBoard[row][col];
        if (cell.userNotes.has(num) || cell.autoNotes.has(num)) { cell.userNotes.delete(num); cell.autoNotes.delete(num); }
        else cell.userNotes.add(num);
        cell.value = 0;
        setBoard(newBoard);
    } else {
        placeNumberOnBoard(row, col, num);
    }
  }, [board, isNotesMode, selectedCell, isGameWon, solution, placeNumberOnBoard]);
  
  const handleNumPadAction = (num) => {
    if (selectedCell) {
      handleNumberClick(num);
    } else if (isNotesMode) {
      setHighlightedNumPad(prev => prev === num ? null : num);
    }
  };

  const handleDelete = useCallback(() => {
    if (!selectedCell || isGameWon) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (cell.isInitial || (cell.value === 0 && cell.userNotes.size === 0 && cell.autoNotes.size === 0 && cell.eliminatedNotes.size === 0)) return;
    setHistory(prev => [...prev, board]);
    setRedoHistory([]);
    setActiveHint(null);
    const newBoard = deepCopyBoard(board);
    Object.assign(newBoard[row][col], { value: 0, userNotes: new Set(), autoNotes: new Set(), eliminatedNotes: new Set(), isWrong: false });
    setBoard(newBoard);
  }, [board, selectedCell, isGameWon]);
  
  const handleHint = useCallback(() => {
    if (isHintOnCooldown || isGameWon || solution.length === 0) return;
    if (activeHint) {
        if (activeHint.solve) placeNumberOnBoard(activeHint.solve.row, activeHint.solve.col, activeHint.solve.num, true);
        else if (activeHint.eliminations?.length > 0) {
            setHistory(prev => [...prev, board]);
            setRedoHistory([]);
            const newBoard = deepCopyBoard(board);
            activeHint.eliminations.forEach(({ row, col, num }) => {
                newBoard[row][col].eliminatedNotes.add(num);
                newBoard[row][col].userNotes.delete(num);
                newBoard[row][col].autoNotes.delete(num);
            });
            setBoard(newBoard);
            setHintEffect({ type: 'note-pop', eliminations: activeHint.eliminations });
        }
        setActiveHint(null);
        return;
    }
    const hint = findHint(board, difficulty, selectedCell);
    if (hint) {
        setActiveHint(hint);
        if (hint.primaryCells.length === 1 && hint.solve) setHintEffect({ type: 'cell-glow', cell: hint.primaryCells[0] });
        startCooldown();
        setHintUsageCount(prev => prev + 1);
    } else {
        setHintButtonEffect('shake');
        setTimeout(() => setHintButtonEffect(null), 300);
    }
  }, [board, isHintOnCooldown, selectedCell, isGameWon, solution, activeHint, difficulty, placeNumberOnBoard, startCooldown]);
  
  const handleSetAutoNotes = (enabled) => {
    setIsAutoNotesEnabled(enabled);
    const newBoard = deepCopyBoard(board);
    for (let r=0; r<9; r++) for (let c=0; c<9; c++) {
      if (enabled && newBoard[r][c].value === 0 && newBoard[r][c].userNotes.size === 0) newBoard[r][c].autoNotes = calculateCandidates(newBoard, r, c);
      else newBoard[r][c].autoNotes.clear();
    }
    setHistory(prev => [...prev, board]);
    setRedoHistory([]);
    setBoard(newBoard);
  };
  
  const handleCloseSettings = (newDifficulty) => {
    setIsSettingsOpen(false);
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      localStorage.setItem('sudoku-difficulty', newDifficulty);
      startNewGame(newDifficulty);
    }
  };

  useEffect(() => {
    const serialize = (k, v) => v instanceof Set ? { __dataType: 'Set', value: [...v] } : v;
    const deserialize = (k, v) => v?.__dataType === 'Set' ? new Set(v.value) : v;

    const saved = localStorage.getItem('sudoku-saved-game');
    if (saved) {
        try {
            const gameState = JSON.parse(saved, deserialize);
            setBoard(gameState.board);
            setSolution(gameState.solution);
            setHistory(gameState.history || []);
            setRedoHistory(gameState.redoHistory || []);
            setElapsedTime(gameState.elapsedTime || 0);
            setMovesCount(gameState.movesCount || 0);
            setMistakesCount(gameState.mistakesCount || 0);
            setHintUsageCount(gameState.hintUsageCount || 0);
            if (gameState.difficulty) setDifficulty(gameState.difficulty);
            setIsTimerRunning(true);
        } catch(e) { startNewGame(difficulty); }
    } else {
        startNewGame(difficulty);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('sudoku-dark-mode', String(isDarkMode));
    localStorage.setItem('sudoku-auto-notes', String(isAutoNotesEnabled));
    localStorage.setItem('sudoku-highlight-notes', String(isHighlightNotesEnabled));
    localStorage.setItem('sudoku-timer-visible', String(isTimerVisible));
    localStorage.setItem('sudoku-stats', JSON.stringify(stats));
    if (board.length > 0 && !isGameWon) {
      const serialize = (k, v) => v instanceof Set ? { __dataType: 'Set', value: [...v] } : v;
      localStorage.setItem('sudoku-saved-game', JSON.stringify({ board, solution, history, redoHistory, elapsedTime, movesCount, mistakesCount, difficulty, hintUsageCount }, serialize));
    }
  });

  useEffect(() => { if (isGameWon) setAnimationState('playing'); }, [isGameWon]);
  
  useEffect(() => {
    let intervalId;
    if (isTimerRunning && !isUIBlocked && !isGameWon) {
      intervalId = setInterval(() => setElapsedTime(prev => prev + 1000), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isTimerRunning, isUIBlocked, isGameWon]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsTimerRunning(!document.hidden && !isUIBlocked && !isGameWon);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isUIBlocked, isGameWon]);
  
  useEffect(() => {
    if (selectedCell) {
        setHighlightedNumPad(null);
    }
  }, [selectedCell]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameWon || isUIBlocked) return;
      if (!selectedCell && e.key.startsWith('Arrow')) { setSelectedCell({ row: 0, col: 0 }); e.preventDefault(); return; }
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      switch (e.key) {
        case 'ArrowUp': setSelectedCell({ row: Math.max(0, row - 1), col }); e.preventDefault(); break;
        case 'ArrowDown': setSelectedCell({ row: Math.min(8, row + 1), col }); e.preventDefault(); break;
        case 'ArrowLeft': setSelectedCell({ row, col: Math.max(0, col - 1) }); e.preventDefault(); break;
        case 'ArrowRight': setSelectedCell({ row, col: Math.min(8, col + 1) }); e.preventDefault(); break;
        case 'Backspace': case 'Delete': handleDelete(); e.preventDefault(); break;
        case 'Escape': setSelectedCell(null); e.preventDefault(); break;
        default: if (!isNaN(e.key) && e.key >= 1 && e.key <= 9) handleNumberClick(Number(e.key)); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleDelete, handleNumberClick, isGameWon, isUIBlocked]);

  if (board.length === 0 || solution.length === 0) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Generating Puzzle...</div>;
  }
  
  const highlightedNumFromCell = selectedCell && board[selectedCell.row][selectedCell.col].value > 0 ? board[selectedCell.row][selectedCell.col].value : null;
  const highlightedNum = highlightedNumFromCell ?? highlightedNumPad;
  const hintDisplay = <div className="relative w-full h-6"><div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${activeHint ? 'opacity-100' : 'opacity-0'}`}>{activeHint && <div className={`px-4 py-1 rounded-full text-sm font-bold shadow-md ${isDarkMode ? 'bg-slate-700 text-amber-300' : 'bg-slate-200 text-slate-700'}`}>{activeHint.type}</div>}</div></div>;

  return (
    <div className="min-h-screen font-sans relative" onClick={() => { setSelectedCell(null); setHighlightedNumPad(null); }}>
      <Header isDarkMode={isDarkMode} onOpenSettings={() => setIsSettingsOpen(true)} onOpenStats={() => setIsStatsOpen(true)} onNewGame={() => startNewGame(difficulty)} />
      <div className={`min-h-screen flex flex-col items-center justify-start pt-16 pb-[calc(1rem+env(safe-area-inset-bottom))] px-4`}>
        <main className={`w-full max-w-lg flex flex-col items-center gap-2 transition-all duration-300 ${isUIBlocked ? 'blur-sm pointer-events-none' : ''}`}>
            {hintDisplay}
            <div className="relative w-full mt-2" onClick={(e) => e.stopPropagation()}>
              {animationState !== 'idle' && <VictoryScreen message={victoryMessage} moves={movesCount} time={formatTime(elapsedTime)} mistakes={mistakesCount} hints={hintUsageCount} />}
              <SudokuBoard board={board} solution={solution} selectedCell={selectedCell} onCellClick={(r, c) => { if (isGameWon) return; if (activeHint) setActiveHint(null); setSelectedCell(p => p?.row === r && p?.col === c ? null : {row: r, col: c})}} isNotesMode={isNotesMode} isDarkMode={isDarkMode} forceDarkMode={isGameWon} isAutoNotesEnabled={isAutoNotesEnabled} isHighlightNotesEnabled={isHighlightNotesEnabled} highlightedNumber={highlightedNum} activeHint={activeHint} hintEffect={hintEffect} />
            </div>
            <div className="relative w-full flex flex-col items-center gap-0 mt-2">
              <div className={`w-full transition-opacity duration-300 ease-in-out ${isGameWon ? 'opacity-0 pointer-events-none' : ''}`}>
                <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? 'translate-y-8' : ''}`} onClick={(e) => e.stopPropagation()}><NumberPad onNumberClick={handleNumPadAction} isNotesMode={isNotesMode} isDarkMode={isDarkMode} highlightedNumber={highlightedNumPad} /></div>
              </div>
              <div className="relative w-full flex justify-center" style={{minHeight: '80px'}}>
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out ${isGameWon ? 'opacity-0 pointer-events-none' : ''}`}>
                  <div className={`transition-transform duration-500 ease-in-out ${isGameWon ? '-translate-y-8' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-4">
                        <Controls isNotesMode={isNotesMode} onToggleNotesMode={() => setIsNotesMode(p => !p)} onUndo={() => {if(history.length>0){setRedoHistory(p=>[...p,board]); setBoard(history[history.length-1]); setHistory(history.slice(0,-1)); setActiveHint(null);}}} canUndo={history.length>0} onRedo={() => {if(redoHistory.length>0){setHistory(p=>[...p,board]); setBoard(redoHistory[redoHistory.length-1]); setRedoHistory(redoHistory.slice(0,-1)); setActiveHint(null);}}} canRedo={redoHistory.length > 0} onHint={handleHint} isHintOnCooldown={isHintOnCooldown} cooldownDuration={4} onDelete={handleDelete} isDarkMode={isDarkMode} hintButtonEffect={hintButtonEffect} />
                        {isTimerVisible && !isGameWon && (
                            <div className={`h-12 flex items-center justify-center px-4 rounded-full text-lg font-semibold tabular-nums tracking-wider transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                                {formatTime(elapsedTime)}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out transform ${isGameWon ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} style={{transitionDelay: isGameWon ? '250ms' : '0ms'}} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => startNewGame(difficulty)} className="bg-slate-800 text-white font-bold py-4 px-16 rounded-full text-2xl hover:bg-slate-700/80 transition-colors transform active:scale-95 shadow-lg"><span className={`transition-opacity duration-300 ease-in-out ${isGameWon ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: isGameWon ? '400ms' : '0ms'}}>Play Again</span></button>
                </div>
              </div>
            </div>
        </main>
      </div>
      <SettingsPanel isOpen={isSettingsOpen} onClose={handleCloseSettings} currentDifficulty={difficulty} isDarkMode={isDarkMode} onToggleDarkMode={(dark) => setIsDarkMode(dark)} onFillBoard={() => { setIsSettingsOpen(false); setTimeout(() => { const solved = solution.map(r => r.map(v => ({value: v, isInitial: false, isWrong: false, userNotes: new Set(), autoNotes: new Set(), eliminatedNotes: new Set()}))); setBoard(solved); triggerWinState(); }, 300); }} isAutoNotesEnabled={isAutoNotesEnabled} onSetAutoNotes={handleSetAutoNotes} isHighlightNotesEnabled={isHighlightNotesEnabled} onSetHighlightNotes={setIsHighlightNotesEnabled} isTimerVisible={isTimerVisible} onSetIsTimerVisible={setIsTimerVisible} />
      <StatsPanel isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} stats={stats} isDarkMode={isDarkMode} />
    </div>
  );
}