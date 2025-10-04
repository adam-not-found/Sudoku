// --- HINT LOGIC SERVICE ---
export const calculateCandidates = (currentBoard, row, col) => {
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

const getNotes = (board, row, col) => {
    const cell = board[row][col];
    if (cell.value !== 0) return new Set();
    const candidates = calculateCandidates(board, row, col);
    cell.eliminatedNotes.forEach(eliminated => candidates.delete(eliminated));
    return candidates;
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

const findHiddenSingle = (board, targetCell) => {
    const unitConfigs = [];
    if (targetCell) {
        const boxIndex = Math.floor(targetCell.row / 3) * 3 + Math.floor(targetCell.col / 3);
        unitConfigs.push({ type: 'row', index: targetCell.row, cells: getUnitCells('row', targetCell.row) });
        unitConfigs.push({ type: 'col', index: targetCell.col, cells: getUnitCells('col', targetCell.col) });
        unitConfigs.push({ type: 'box', index: boxIndex, cells: getUnitCells('box', boxIndex) });
    } else {
        for(let i=0; i<9; i++) {
            unitConfigs.push({ type: 'row', index: i, cells: getUnitCells('row', i) });
            unitConfigs.push({ type: 'col', index: i, cells: getUnitCells('col', i) });
            unitConfigs.push({ type: 'box', index: i, cells: getUnitCells('box', i) });
        }
    }

    for (const unit of unitConfigs) {
        const candidateMap = new Map();
        for (let num = 1; num <= 9; num++) { candidateMap.set(num, []); }

        for (const cell of unit.cells) {
            if (board[cell.row][cell.col].value === 0) {
                const notes = getNotes(board, cell.row, cell.col);
                notes.forEach(num => {
                    candidateMap.get(num).push(cell);
                });
            }
        }

        for (let num = 1; num <= 9; num++) {
            const possibleCells = candidateMap.get(num);
            if (possibleCells.length === 1) {
                const target = possibleCells[0];
                if (targetCell && (target.row !== targetCell.row || target.col !== targetCell.col)) {
                    continue;
                }
                const secondaryCells = unit.cells.filter(c => !(c.row === target.row && c.col === target.col));
                return {
                    type: 'Hidden Single',
                    primaryCells: [target],
                    secondaryCells: secondaryCells,
                    eliminations: [],
                    solve: { row: target.row, col: target.col, num },
                };
            }
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

                if (notes1Arr.length === 2 && notes1Arr[0] === notes2Arr[0] && notes1Arr[1] === notes2Arr[1]) {
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
};

const findHiddenPair = (board, targetCell) => {
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
        const candidateMap = new Map();
        for (let num = 1; num <= 9; num++) { candidateMap.set(num, []); }

        for (const cell of unit) {
            if (board[cell.row][cell.col].value === 0) {
                getNotes(board, cell.row, cell.col).forEach(num => {
                    candidateMap.get(num).push(cell);
                });
            }
        }

        const numsInTwoCells = [];
        for (let num = 1; num <= 9; num++) {
            if (candidateMap.get(num).length === 2) {
                numsInTwoCells.push(num);
            }
        }

        if (numsInTwoCells.length < 2) continue;

        for (let i = 0; i < numsInTwoCells.length; i++) {
            for (let j = i + 1; j < numsInTwoCells.length; j++) {
                const num1 = numsInTwoCells[i];
                const num2 = numsInTwoCells[j];
                const cells1 = candidateMap.get(num1);
                const cells2 = candidateMap.get(num2);

                const cells1Ids = cells1.map(c => `${c.row}-${c.col}`).sort();
                const cells2Ids = cells2.map(c => `${c.row}-${c.col}`).sort();

                if (cells1Ids[0] === cells2Ids[0] && cells1Ids[1] === cells2Ids[1]) {
                    const primaryCells = cells1;
                    if (targetCell && !primaryCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;

                    const allNotesInPair = new Set([...getNotes(board, primaryCells[0].row, primaryCells[0].col), ...getNotes(board, primaryCells[1].row, primaryCells[1].col)]);
                    allNotesInPair.delete(num1);
                    allNotesInPair.delete(num2);

                    const eliminations = [];
                    allNotesInPair.forEach(note => {
                        eliminations.push({ row: primaryCells[0].row, col: primaryCells[0].col, num: note });
                        eliminations.push({ row: primaryCells[1].row, col: primaryCells[1].col, num: note });
                    });
                    
                    const uniqueElims = eliminations.filter((v,i,a)=>a.findIndex(t=>(t.row === v.row && t.col===v.col && t.num === v.num))===i);

                    if (uniqueElims.length > 0) {
                        return {
                            type: 'Hidden Pair',
                            primaryCells,
                            secondaryCells: [],
                            eliminations: uniqueElims,
                            solve: null,
                        };
                    }
                }
            }
        }
    }
    return null;
};

const findNakedTriple = (board, targetCell) => {
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
        const candidateCells = unit.filter(cell => {
            const notes = getNotes(board, cell.row, cell.col);
            return notes.size > 1 && notes.size <= 3;
        });

        if (candidateCells.length < 3) continue;

        for (let i = 0; i < candidateCells.length; i++) {
            for (let j = i + 1; j < candidateCells.length; j++) {
                for (let k = j + 1; k < candidateCells.length; k++) {
                    const c1 = candidateCells[i], c2 = candidateCells[j], c3 = candidateCells[k];
                    const n1 = getNotes(board, c1.row, c1.col), n2 = getNotes(board, c2.row, c2.col), n3 = getNotes(board, c3.row, c3.col);
                    const combinedNotes = new Set([...n1, ...n2, ...n3]);

                    if (combinedNotes.size === 3) {
                        const primaryCells = [c1, c2, c3];
                        if (targetCell && !primaryCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;

                        const tripleNums = [...combinedNotes];
                        const eliminations = [], secondaryCells = [];

                        for (const unitCell of unit) {
                            if (primaryCells.some(pc => pc.row === unitCell.row && pc.col === unitCell.col)) continue;
                            
                            const unitCellNotes = getNotes(board, unitCell.row, unitCell.col);
                            let madeElimination = false;
                            for (const num of tripleNums) {
                                if (unitCellNotes.has(num)) {
                                    eliminations.push({ row: unitCell.row, col: unitCell.col, num });
                                    madeElimination = true;
                                }
                            }
                            if (madeElimination) secondaryCells.push(unitCell);
                        }

                        if (eliminations.length > 0) {
                            const uniqueSecondary = secondaryCells.filter((v,i,a)=>a.findIndex(t=>(t.row === v.row && t.col===v.col))===i);
                            return {
                                type: 'Naked Triple',
                                primaryCells,
                                secondaryCells: uniqueSecondary,
                                eliminations,
                                solve: null,
                            };
                        }
                    }
                }
            }
        }
    }
    return null;
};

const findHiddenTriple = (board, targetCell) => {
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
        const candidateMap = new Map();
        for (let num = 1; num <= 9; num++) { candidateMap.set(num, []); }

        for (const cell of unit) {
            if (board[cell.row][cell.col].value === 0) {
                getNotes(board, cell.row, cell.col).forEach(num => {
                    candidateMap.get(num).push(cell);
                });
            }
        }

        const candidateNums = [];
        for (let num = 1; num <= 9; num++) {
            const cells = candidateMap.get(num);
            if (cells.length === 2 || cells.length === 3) candidateNums.push(num);
        }
        if (candidateNums.length < 3) continue;

        for (let i = 0; i < candidateNums.length; i++) {
            for (let j = i + 1; j < candidateNums.length; j++) {
                for (let k = j + 1; k < candidateNums.length; k++) {
                    const num1 = candidateNums[i], num2 = candidateNums[j], num3 = candidateNums[k];
                    const cells1 = candidateMap.get(num1), cells2 = candidateMap.get(num2), cells3 = candidateMap.get(num3);
                    const combinedCells = [...cells1, ...cells2, ...cells3];
                    const uniqueCellIds = new Set(combinedCells.map(c => `${c.row}-${c.col}`));
                    
                    if (uniqueCellIds.size === 3) {
                        const primaryCells = [...uniqueCellIds].map(id => ({ row: parseInt(id.split('-')[0]), col: parseInt(id.split('-')[1]) }));
                        if (targetCell && !primaryCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                        
                        const tripleNums = new Set([num1, num2, num3]);
                        const eliminations = [];

                        for (const cell of primaryCells) {
                            getNotes(board, cell.row, cell.col).forEach(note => {
                                if (!tripleNums.has(note)) {
                                    eliminations.push({ row: cell.row, col: cell.col, num: note });
                                }
                            });
                        }

                        if (eliminations.length > 0) {
                            return {
                                type: 'Hidden Triple',
                                primaryCells,
                                secondaryCells: [],
                                eliminations,
                                solve: null,
                            };
                        }
                    }
                }
            }
        }
    }
    return null;
};

const findIntersectionRemoval = (board, targetCell) => {
    // Pointing
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
        const boxCells = getUnitCells('box', boxIndex);
        for (let num = 1; num <= 9; num++) {
            const candidateCells = boxCells.filter(cell => getNotes(board, cell.row, cell.col).has(num));
            if (candidateCells.length < 2) continue;

            const rows = new Set(candidateCells.map(c => c.row));
            const cols = new Set(candidateCells.map(c => c.col));

            if (rows.size === 1) { // All candidates for num in this box are in the same row
                const row = rows.values().next().value;
                const rowCells = getUnitCells('row', row);
                const eliminations = [];
                for (const cell of rowCells) {
                    const inBox = Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3) === boxIndex;
                    if (!inBox && getNotes(board, cell.row, cell.col).has(num)) {
                        eliminations.push({ row: cell.row, col: cell.col, num });
                    }
                }
                if (eliminations.length > 0) {
                    if (targetCell && !candidateCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                    const secondaryCells = eliminations.map(e => ({row: e.row, col: e.col}));
                    return { type: 'Pointing', primaryCells: candidateCells, secondaryCells, eliminations, solve: null };
                }
            }
            if (cols.size === 1) { // All candidates for num in this box are in the same col
                const col = cols.values().next().value;
                const colCells = getUnitCells('col', col);
                const eliminations = [];
                for (const cell of colCells) {
                    const inBox = Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3) === boxIndex;
                    if (!inBox && getNotes(board, cell.row, cell.col).has(num)) {
                        eliminations.push({ row: cell.row, col: cell.col, num });
                    }
                }
                if (eliminations.length > 0) {
                    if (targetCell && !candidateCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                    const secondaryCells = eliminations.map(e => ({row: e.row, col: e.col}));
                    return { type: 'Pointing', primaryCells: candidateCells, secondaryCells, eliminations, solve: null };
                }
            }
        }
    }

    // Claiming
    for (let num = 1; num <= 9; num++) {
        for (let i = 0; i < 9; i++) {
            // Row Claiming
            const rowCells = getUnitCells('row', i);
            const rowCandidates = rowCells.filter(cell => getNotes(board, cell.row, cell.col).has(num));
            if (rowCandidates.length > 1) {
                const boxes = new Set(rowCandidates.map(c => Math.floor(c.row/3)*3 + Math.floor(c.col/3)));
                if (boxes.size === 1) {
                    const boxIndex = boxes.values().next().value;
                    const boxCells = getUnitCells('box', boxIndex);
                    const eliminations = [];
                    for(const cell of boxCells) {
                        if (cell.row !== i && getNotes(board, cell.row, cell.col).has(num)) {
                            eliminations.push({ row: cell.row, col: cell.col, num });
                        }
                    }
                    if (eliminations.length > 0) {
                         if (targetCell && !rowCandidates.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                         const secondaryCells = eliminations.map(e => ({row: e.row, col: e.col}));
                         return { type: 'Claiming', primaryCells: rowCandidates, secondaryCells, eliminations, solve: null };
                    }
                }
            }

            // Col Claiming
            const colCells = getUnitCells('col', i);
            const colCandidates = colCells.filter(cell => getNotes(board, cell.row, cell.col).has(num));
            if (colCandidates.length > 1) {
                const boxes = new Set(colCandidates.map(c => Math.floor(c.row/3)*3 + Math.floor(c.col/3)));
                if (boxes.size === 1) {
                    const boxIndex = boxes.values().next().value;
                    const boxCells = getUnitCells('box', boxIndex);
                    const eliminations = [];
                     for(const cell of boxCells) {
                        if (cell.col !== i && getNotes(board, cell.row, cell.col).has(num)) {
                            eliminations.push({ row: cell.row, col: cell.col, num });
                        }
                    }
                    if (eliminations.length > 0) {
                        if (targetCell && !colCandidates.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                        const secondaryCells = eliminations.map(e => ({row: e.row, col: e.col}));
                        return { type: 'Claiming', primaryCells: colCandidates, secondaryCells, eliminations, solve: null };
                    }
                }
            }
        }
    }
    return null;
};

const findXWing = (board, targetCell) => {
    for (let num = 1; num <= 9; num++) {
        // Row-based X-Wing
        const rowCandidates = [];
        for (let r = 0; r < 9; r++) {
            const cols = [];
            for (let c = 0; c < 9; c++) { if (getNotes(board, r, c).has(num)) { cols.push(c); } }
            if (cols.length === 2) { rowCandidates.push({ row: r, cols: cols }); }
        }

        if (rowCandidates.length >= 2) {
            for (let i = 0; i < rowCandidates.length; i++) {
                for (let j = i + 1; j < rowCandidates.length; j++) {
                    const r1 = rowCandidates[i], r2 = rowCandidates[j];
                    if (r1.cols[0] === r2.cols[0] && r1.cols[1] === r2.cols[1]) {
                        const c1 = r1.cols[0], c2 = r1.cols[1];
                        const primaryCells = [ { row: r1.row, col: c1 }, { row: r1.row, col: c2 }, { row: r2.row, col: c1 }, { row: r2.row, col: c2 }];
                        if (targetCell && !primaryCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;
                        const eliminations = [];
                        for (let r = 0; r < 9; r++) {
                            if (r !== r1.row && r !== r2.row) {
                                if (getNotes(board, r, c1).has(num)) eliminations.push({ row: r, col: c1, num });
                                if (getNotes(board, r, c2).has(num)) eliminations.push({ row: r, col: c2, num });
                            }
                        }
                        if (eliminations.length > 0) {
                            const secondaryCells = eliminations.map(e => ({row: e.row, col: e.col}));
                            return { type: 'X-Wing', primaryCells, secondaryCells, eliminations, solve: null };
                        }
                    }
                }
            }
        }
    }
    return null;
};

const findSwordfish = (board, targetCell) => {
    for (let num = 1; num <= 9; num++) {
        // Row-based Swordfish
        const rowCandidates = [];
        for (let r = 0; r < 9; r++) {
            const cols = [];
            for (let c = 0; c < 9; c++) { if (getNotes(board, r, c).has(num)) { cols.push(c); } }
            if (cols.length === 2 || cols.length === 3) { rowCandidates.push({ row: r, cols }); }
        }

        if (rowCandidates.length >= 3) {
            for (let i = 0; i < rowCandidates.length; i++) {
                for (let j = i + 1; j < rowCandidates.length; j++) {
                    for (let k = j + 1; k < rowCandidates.length; k++) {
                        const r1 = rowCandidates[i], r2 = rowCandidates[j], r3 = rowCandidates[k];
                        const combinedCols = new Set([...r1.cols, ...r2.cols, ...r3.cols]);
                        if (combinedCols.size === 3) {
                            const [c1, c2, c3] = [...combinedCols].sort();
                            const primaryRows = [r1.row, r2.row, r3.row];
                            const primaryCells = [];
                            primaryRows.forEach(r => {
                                [c1, c2, c3].forEach(c => {
                                    if(getNotes(board, r, c).has(num)) primaryCells.push({row: r, col: c});
                                });
                            });
                            
                            if (targetCell && !primaryCells.some(pc => pc.row === targetCell.row && pc.col === targetCell.col)) continue;

                            const eliminations = [];
                            for (let r = 0; r < 9; r++) {
                                if (!primaryRows.includes(r)) {
                                    if (getNotes(board, r, c1).has(num)) eliminations.push({ row: r, col: c1, num });
                                    if (getNotes(board, r, c2).has(num)) eliminations.push({ row: r, col: c2, num });
                                    if (getNotes(board, r, c3).has(num)) eliminations.push({ row: r, col: c3, num });
                                }
                            }
                            if (eliminations.length > 0) {
                                const secondaryCells = eliminations.map(e => ({row: e.row, col: e.col}));
                                return { type: 'Swordfish', primaryCells, secondaryCells, eliminations, solve: null };
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
};


export const findHint = (board, difficulty, targetCell, technique = null) => {
    const findFunctions = {
        nakedSingle: () => findNakedSingle(board, targetCell),
        hiddenSingle: () => findHiddenSingle(board, targetCell),
        nakedPair: () => findNakedPair(board, targetCell),
        hiddenPair: () => findHiddenPair(board, targetCell),
        nakedTriple: () => findNakedTriple(board, targetCell),
        hiddenTriple: () => findHiddenTriple(board, targetCell),
        intersectionRemoval: () => findIntersectionRemoval(board, targetCell),
        xWing: () => findXWing(board, targetCell),
        swordfish: () => findSwordfish(board, targetCell),
    };
    
    // If a specific technique is requested (i.e., for rating puzzles), find and return it directly.
    if (technique && findFunctions[technique]) {
        return findFunctions[technique]();
    }
    
    // For user-requested hints, find the first "actionable" hint.
    const techniquesByDifficulty = {
        easy: ['nakedSingle', 'hiddenSingle'],
        medium: ['nakedSingle', 'hiddenSingle'],
        hard: ['nakedSingle', 'hiddenSingle', 'nakedPair', 'hiddenPair', 'nakedTriple', 'hiddenTriple'],
        professional: ['nakedSingle', 'hiddenSingle', 'nakedPair', 'hiddenPair', 'nakedTriple', 'hiddenTriple', 'intersectionRemoval', 'xWing', 'swordfish'],
    };

    const techniquesToTry = techniquesByDifficulty[difficulty] || techniquesByDifficulty.professional;

    for (const techName of techniquesToTry) {
        const hint = findFunctions[techName]();
        if (hint) {
            // A hint with a "solve" action is always actionable.
            if (hint.solve) {
                return hint;
            }
            // A hint with "eliminations" is actionable only if it removes at least one
            // note that the user can currently see (a user note or an auto note).
            if (hint.eliminations && hint.eliminations.length > 0) {
                const isActionable = hint.eliminations.some(({ row, col, num }) => {
                    const cell = board[row][col];
                    return cell.userNotes.has(num) || cell.autoNotes.has(num);
                });

                if (isActionable) {
                    return hint;
                }
            }
        }
    }

    return null;
};
