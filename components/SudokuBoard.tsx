/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Cell } from './Cell.tsx';

export const SudokuBoard = ({ board, solution, selectedCell, onCellClick, isNotesMode, isDarkMode, forceDarkMode, isAutoNotesEnabled, isHighlightNotesEnabled, highlightedNumber, activeHint, hintEffect }) => {
  const isDark = isDarkMode || forceDarkMode;
  const outerBorderBgColor = isDark ? 'bg-slate-600' : 'bg-slate-300';
  const thickInnerBorderColor = isDark ? 'bg-slate-500' : 'bg-slate-400';
  const thinInnerBorderColor = isDark ? 'bg-slate-700/65' : 'bg-slate-200';

  return (
    <div className={`relative transition-all duration-300 ease-in-out aspect-square w-full transform-gpu ${isNotesMode ? 'scale-[1.03]' : ''}`}>
      <div className={`absolute inset-0 rounded-2xl ${outerBorderBgColor}`}></div>
      <div className={`absolute inset-[6px] grid grid-cols-3 grid-rows-3 gap-0.5 ${thickInnerBorderColor} rounded-xl overflow-hidden`}>
        {Array.from({ length: 9 }).map((_, boxIndex) => {
          const boxRowStart = Math.floor(boxIndex / 3) * 3;
          const boxColStart = (boxIndex % 3) * 3;
          
          let boxCornerClass = '';
          if (boxIndex === 0) boxCornerClass = 'rounded-tl-xl';
          if (boxIndex === 2) boxCornerClass = 'rounded-tr-xl';
          if (boxIndex === 6) boxCornerClass = 'rounded-bl-xl';
          if (boxIndex === 8) boxCornerClass = 'rounded-br-xl';

          return (
            <div key={boxIndex} className={`grid grid-cols-3 grid-rows-3 gap-0.5 ${thinInnerBorderColor} ${boxCornerClass}`}>
              {Array.from({ length: 9 }).map((_, cellInBoxIndex) => {
                const cellRow = Math.floor(cellInBoxIndex / 3);
                const cellCol = cellInBoxIndex % 3;
                const rowIndex = boxRowStart + cellRow;
                const colIndex = boxColStart + cellCol;
                const cellData = board[rowIndex][colIndex];
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isPeer = selectedCell ? 
                  (selectedCell.row === rowIndex || selectedCell.col === colIndex || 
                  (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)))
                  : false;
                const isCorrect = !cellData.isInitial && cellData.value !== 0 && cellData.value === solution[rowIndex][colIndex];
                
                let isHighlighted = false;
                if (highlightedNumber !== null && !isSelected) {
                  const isHighlightedByValue = cellData.value === highlightedNumber;
                  const isHighlightedByNote =
                    isHighlightNotesEnabled &&
                    cellData.value === 0 &&
                    (cellData.userNotes.has(highlightedNumber) || cellData.autoNotes.has(highlightedNumber));
                  isHighlighted = isHighlightedByValue || isHighlightedByNote;
                }

                const isHintPrimary = !!activeHint?.primaryCells.some(c => c.row === rowIndex && c.col === colIndex);
                const isHintSecondary = !!activeHint?.secondaryCells.some(c => c.row === rowIndex && c.col === colIndex);
                
                let cellCornerClass = '';
                if (rowIndex === 0 && colIndex === 0) cellCornerClass = 'rounded-tl-sm';
                if (rowIndex === 0 && colIndex === 8) cellCornerClass = 'rounded-tr-sm';
                if (rowIndex === 8 && colIndex === 0) cellCornerClass = 'rounded-bl-sm';
                if (rowIndex === 8 && colIndex === 8) cellCornerClass = 'rounded-br-sm';

                return (
                  <Cell 
                    key={`${rowIndex}-${colIndex}`}
                    data={cellData}
                    isSelected={isSelected}
                    isPeer={isPeer && !isSelected}
                    isHighlighted={isHighlighted}
                    isCorrect={isCorrect}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                    isDarkMode={isDark}
                    isNotesMode={isNotesMode}
                    className={cellCornerClass}
                    isAutoNotesEnabled={isAutoNotesEnabled}
                    highlightedNumber={highlightedNumber}
                    isHintPrimary={isHintPrimary}
                    isHintSecondary={isHintSecondary}
                    hintEffect={hintEffect}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
