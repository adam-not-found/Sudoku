import React from 'react';
import Cell from './Cell';

export default function SudokuBoard({ board, solution, selectedCell, onCellClick, isNotesMode, isDarkMode, forceDarkMode, isAutoNotesEnabled, isHighlightNotesEnabled, highlightedNumber, activeHint, hintEffect }) {
  const isDark = isDarkMode || forceDarkMode;
  const outerBorderBgColor = isDark ? 'bg-slate-600' : 'bg-slate-300';
  const thickInnerBorderColor = isDark ? 'bg-slate-500' : 'bg-slate-400';
  const thinInnerBorderColor = isDark ? 'bg-slate-700/65' : 'bg-slate-200';

  return (
    <div className={`relative transition-all duration-300 ease-in-out aspect-square w-full transform-gpu ${isNotesMode ? 'scale-[1.03]' : ''}`}>
      <div className={`absolute inset-0 rounded-2xl ${outerBorderBgColor}`}></div>
      <div className={`absolute inset-[6px] grid grid-cols-3 grid-rows-3 gap-[2px] ${thickInnerBorderColor} rounded-xl overflow-hidden`}>
        {Array.from({ length: 9 }).map((_, boxIndex) => (
          <div key={boxIndex} className={`grid grid-cols-3 grid-rows-3 gap-[1px] ${thinInnerBorderColor} ${boxIndex===0?'rounded-tl-xl':''} ${boxIndex===2?'rounded-tr-xl':''} ${boxIndex===6?'rounded-bl-xl':''} ${boxIndex===8?'rounded-br-xl':''}`}>
            {Array.from({ length: 9 }).map((_, cellInBoxIndex) => {
              const boxRowStart = Math.floor(boxIndex / 3) * 3, boxColStart = (boxIndex % 3) * 3;
              const rowIndex = boxRowStart + Math.floor(cellInBoxIndex / 3), colIndex = boxColStart + (cellInBoxIndex % 3);
              const cellData = board[rowIndex][colIndex];
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              const isPeer = selectedCell ? (selectedCell.row === rowIndex || selectedCell.col === colIndex || (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3))) : false;
              let isHighlighted = false;
              if (highlightedNumber !== null && !isSelected) {
                isHighlighted = cellData.value === highlightedNumber || (isHighlightNotesEnabled && cellData.value === 0 && (cellData.userNotes.has(highlightedNumber) || cellData.autoNotes.has(highlightedNumber)));
              }
              
              return (
                // FIX: Moved the `key` prop to a `React.Fragment` wrapper. The `Cell` component's
                // inferred type did not include the special `key` prop, causing a TypeScript error.
                // Using a fragment provides a valid target for the key without adding a DOM element.
                <React.Fragment key={`${rowIndex}-${colIndex}`}>
                  <Cell
                    data={cellData} isSelected={isSelected} isPeer={isPeer && !isSelected}
                    isHighlighted={isHighlighted} isCorrect={!cellData.isInitial && cellData.value !== 0 && cellData.value === solution[rowIndex][colIndex]}
                    onClick={() => onCellClick(rowIndex, colIndex)} isDarkMode={isDark} isNotesMode={isNotesMode}
                    isAutoNotesEnabled={isAutoNotesEnabled} highlightedNumber={highlightedNumber}
                    isHintPrimary={!!activeHint?.primaryCells.some(c => c.row === rowIndex && c.col === colIndex)}
                    isHintSecondary={!!activeHint?.secondaryCells.some(c => c.row === rowIndex && c.col === colIndex)}
                    hintEffect={hintEffect} rowIndex={rowIndex} colIndex={colIndex}
                  />
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}