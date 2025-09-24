/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import Cell, { CellData } from './FilterPanel'; // Re-using FilterPanel.tsx for Cell.tsx

interface SudokuBoardProps {
  board: CellData[][];
  solution: number[][];
  selectedCell: { row: number, col: number } | null;
  onCellClick: (row: number, col: number) => void;
  isNotesMode: boolean;
  isDarkMode: boolean;
  forceDarkMode?: boolean;
  isAutoNotesEnabled: boolean;
  highlightedNumber: number | null;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({ board, solution, selectedCell, onCellClick, isNotesMode, isDarkMode, forceDarkMode, isAutoNotesEnabled, highlightedNumber }) => {
  
  const isDark = isDarkMode || forceDarkMode;

  // Define border colors. The backgrounds of the nested grid containers will act as the grid lines.
  const outerBorderColor = isDark ? 'bg-slate-600' : 'bg-slate-300';
  const thickInnerBorderColor = isDark ? 'bg-slate-500' : 'bg-slate-400';
  const thinInnerBorderColor = isDark ? 'bg-slate-700/65' : 'bg-slate-200';

  return (
    // Aesthetic wrapper for scaling. Shadow has been removed to fix corner rendering artifacts.
    <div className={`transition-all duration-300 ease-in-out aspect-square w-full ${isNotesMode ? 'scale-[1.03]' : ''}`}>
      {/* Wrapper for rounded corners and clipping. The outer radius is rounded-2xl (16px). */}
      <div className="rounded-2xl overflow-hidden h-full w-full">
        {/* This div creates the outer border effect using padding. p-1.5 is 6px. */}
        <div className={`p-1.5 h-full w-full ${outerBorderColor}`}> 
          {/* BoxGrid: A 3x3 grid for the main boxes. `gap` creates the thick lines.
              The radius is calculated to fit inside the parent's padding. 16px outer - 6px padding = 10px inner.
              We use a slightly smaller value (rounded-lg = 8px) to prevent rendering glitches.
          */}
          <div className={`grid grid-cols-3 grid-rows-3 gap-0.5 h-full w-full ${thickInnerBorderColor} rounded-lg overflow-hidden`}>
            {/* Create 9 boxes by iterating from 0 to 8 */}
            {Array.from({ length: 9 }).map((_, boxIndex) => {
              const boxRowStart = Math.floor(boxIndex / 3) * 3;
              const boxColStart = (boxIndex % 3) * 3;
              
              {/* Radius for corner boxes. 8px outer - 2px gap = 6px inner.
                  We use a smaller value (rounded = 4px) to be safe.
              */}
              let boxCornerClass = '';
              if (boxIndex === 0) boxCornerClass = 'rounded-tl';
              if (boxIndex === 2) boxCornerClass = 'rounded-tr';
              if (boxIndex === 6) boxCornerClass = 'rounded-bl';
              if (boxIndex === 8) boxCornerClass = 'rounded-br';

              return (
                // CellGrid: A 3x3 grid for cells. The `gap` creates thin lines. Corner boxes get rounded.
                <div key={boxIndex} className={`grid grid-cols-3 grid-rows-3 gap-px ${thinInnerBorderColor} ${boxCornerClass}`}>
                  {/* Create 9 cells within the current box */}
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
                    
                    const isHighlighted = highlightedNumber !== null && cellData.value === highlightedNumber && !isSelected;

                    {/* Radius for corner cells. 4px outer - 1px gap = 3px inner. 
                        We use a smaller value (rounded-sm = 2px) to be safe.
                    */}
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
                        className={cellCornerClass}
                        isAutoNotesEnabled={isAutoNotesEnabled}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;