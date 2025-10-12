export interface TutorialGraphicCell {
  value?: number;
  notes?: number[];
  highlights?: {
    cell?: 'primary' | 'secondary';
    notes?: { [key: number]: 'primary' | 'secondary' | 'elim' };
  };
}

export interface Tutorial {
  title: string;
  description: string;
  graphic: TutorialGraphicCell[][];
}

const tutorialData: { [key: string]: Tutorial } = {
  'Naked Single': {
    title: 'Naked Single',
    description: "A 'Naked Single' occurs when a cell has only one possible number (note) remaining. This number must be the solution for that cell.",
    graphic: [
      [{ value: 4 }, { value: 6 }, { notes: [5, 8] }],
      [{ value: 1 }, { notes: [5], highlights: { cell: 'primary'} }, { value: 9 }],
      [{ value: 2 }, { value: 7 }, { value: 3 }],
    ],
  },
  'Hidden Single': {
    title: 'Hidden Single',
    description: "A 'Hidden Single' is found when a specific number can only be placed in one cell within a row, column, or box. It is the only place for that note (e.g., the '4'), so it must be the solution for that cell.",
    graphic: [
      [{ value: 1 }, { notes: [3,8] }, { value: 9 }, { notes: [3,7] }, { notes: [4,7], highlights: { cell: 'primary', notes: {'4': 'primary'} } }, { value: 6 }, { notes: [2,5] }, { notes: [2,3,5] }, { value: 8 }],
    ],
  },
  'Naked Pair': {
    title: 'Naked Pair',
    description: "When two cells in the same unit (row, column, or box) have the exact same two notes, it's a 'Naked Pair'. Those two numbers must go in those two cells, so you can eliminate them from all other cells in that unit.",
    graphic: [
      [{ value: 1 }, { notes: [2, 8], highlights: { cell: 'primary' } }, { notes: [2, 8], highlights: { cell: 'primary' } }, { notes: [2, 4, 5], highlights: { cell: 'secondary', notes: { '2': 'elim' } } }, { value: 9 }],
    ],
  },
  'Hidden Pair': {
    title: 'Hidden Pair',
    description: "A 'Hidden Pair' occurs when two notes (e.g., 4 and 7) appear in only two cells within a unit. You can eliminate all other notes from those two cells.",
    graphic: [
      [
        { notes: [1, 4, 7], highlights: { cell: 'primary', notes: { '1': 'elim', '4': 'primary', '7': 'primary' } } },
        { notes: [1, 3, 9] },
        { notes: [3, 4, 7], highlights: { cell: 'primary', notes: { '3': 'elim', '4': 'primary', '7': 'primary' } } }
      ],
      [
        { notes: [1, 5, 8] },
        { value: 2 },
        { notes: [1, 3, 5] }
      ],
      [
        { notes: [1, 9] },
        { value: 6 },
        { value: 5 }
      ],
    ],
  },
  'Naked Triple': {
    title: 'Naked Triple',
    description: "When three cells in a unit contain only notes from a set of three numbers (e.g., 1, 5, 8), it's a 'Naked Triple'. These three numbers can be eliminated from all other cells in that unit.",
    graphic: [
      [
        { notes: [1, 5], highlights: { cell: 'primary' } }, 
        { notes: [5, 8], highlights: { cell: 'primary' } }, 
        { notes: [1, 8], highlights: { cell: 'primary' } }, 
        { notes: [1, 4, 9], highlights: { cell: 'secondary', notes: { '1': 'elim' } } },
        { notes: [5, 6, 7], highlights: { cell: 'secondary', notes: { '5': 'elim' } } }
      ],
    ],
  },
  'Hidden Triple': {
    title: 'Hidden Triple',
    description: "A 'Hidden Triple' is when three numbers are candidates in only three cells within a unit. You can eliminate all other notes from these three cells.",
    graphic: [
      [
        { notes: [1, 2, 8, 9], highlights: { cell: 'primary', notes: { '1': 'primary', '2': 'primary', '8': 'elim', '9': 'elim' } } },
        { notes: [4, 5] },
        { notes: [2, 3, 7, 9], highlights: { cell: 'primary', notes: { '2': 'primary', '3': 'primary', '7': 'elim', '9': 'elim' } } },
      ],
      [
        { notes: [4, 6] },
        { notes: [1, 3, 5], highlights: { cell: 'primary', notes: { '1': 'primary', '3': 'primary', '5': 'elim' } } },
        { notes: [6, 7] },
      ],
      [
        { value: 8 },
        { value: 9 },
        { value: 7 },
      ],
    ]
  },
  'Pointing': {
    title: 'Pointing Pair/Triple',
    description: "When a number's candidates (e.g., '1') within a box are all in a single row or column, you can eliminate that number from other cells in that row/column outside the box.",
    graphic: [
        [{notes: [1,2]}, {notes: [1,2], highlights: {cell: 'primary'}}, {notes: [1,2], highlights: {cell: 'primary'}}, {notes: [1,7,8], highlights: {cell: 'secondary', notes: {'1': 'elim'}}}, {value: 9}],
        [{notes: [3,4]}, {notes: [3,4]}, {notes: [3,4]}, {value: 5}, {value: 6}],
        [{notes: [5,6]}, {notes: [5,6]}, {notes: [5,6]}, {value: 2}, {value: 3}],
    ]
  },
  'Claiming': {
    title: 'Claiming Pair/Triple',
    description: "When a number's candidates (e.g., '1') within a row or column are all in a single box, you can eliminate that number from other cells in that box.",
     graphic: [
        [{notes: [1,2], highlights: {cell: 'primary'}}, {notes: [7,8]}, {notes: [7,8]}],
        [{notes: [1,2], highlights: {cell: 'primary'}}, {value: 3}, {value: 4}],
        [{notes: [5,6]}, {notes: [1,9], highlights: {cell: 'secondary', notes: {'1': 'elim'}}}, {notes: [1,3], highlights: {cell: 'secondary', notes: {'1': 'elim'}}}],
    ]
  },
  'X-Wing': {
    title: 'X-Wing',
    description: "In two rows, a number (e.g. '5') appears as a candidate in the exact same two columns. This 'X' pattern means you can eliminate that number from all other cells in those columns.",
    graphic: [
        [{value: 1}, {notes: [5,8], highlights: {cell: 'primary'}}, {value: 3}, {notes: [5,9], highlights: {cell: 'primary'}}, {value: 2}],
        [{value: 4}, {notes: [2,5], highlights: {cell: 'secondary', notes: {'5': 'elim'}}}, {value: 6}, {value: 7}, {value: 8}],
        [{value: 6}, {value: 7}, {value: 1}, {notes: [2,5], highlights: {cell: 'secondary', notes: {'5': 'elim'}}}, {value: 3}],
        [{value: 9}, {notes: [5,8], highlights: {cell: 'primary'}}, {value: 2}, {notes: [5,9], highlights: {cell: 'primary'}}, {value: 1}],
    ]
  },
  'Swordfish': {
    title: 'Swordfish',
    description: "In three rows, a number (e.g., '2') appears as a candidate in only the same three columns. You can eliminate that number from all other cells in those three columns.",
    graphic: [
      [{notes: [2,8], highlights:{cell:'primary'}}, {notes: [2,9], highlights:{cell:'secondary', notes:{'2':'elim'}}}, {notes: [2,8], highlights:{cell:'primary'}}, {value: 3}, {notes: [2,8], highlights:{cell:'primary'}}],
      [{value: 3}, {value: 1}, {value: 4}, {value: 5}, {value: 6}],
      [{notes: [2,8], highlights:{cell:'primary'}}, {value: 7}, {notes: [2,8], highlights:{cell:'primary'}}, {value: 9}, {notes: [2,8], highlights:{cell:'primary'}}],
      [{value: 4}, {notes: [2,9], highlights:{cell:'secondary', notes:{'2':'elim'}}}, {value: 6}, {value: 7}, {value: 8}],
      [{notes: [2,8], highlights:{cell:'primary'}}, {value: 9}, {notes: [2,8], highlights:{cell:'primary'}}, {value: 1}, {notes: [2,8], highlights:{cell:'primary'}}],
    ]
  },
  'Jellyfish': {
    title: 'Jellyfish',
    description: "In four rows, a number (e.g., '7') appears as a candidate in only the same four columns. You can eliminate that number from all other cells in those four columns.",
    graphic: [
      [{notes:[7], highlights:{cell:'primary'}}, {value:1}, {notes:[7], highlights:{cell:'primary'}}, {value:2}, {notes:[7], highlights:{cell:'primary'}}, {notes:[7], highlights:{cell:'primary'}}],
      [{value:3}, {notes:[7,9], highlights:{cell:'secondary', notes:{'7':'elim'}}}, {value:4}, {value:5}, {value:6}, {value:8}],
      [{notes:[7], highlights:{cell:'primary'}}, {value:2}, {notes:[7], highlights:{cell:'primary'}}, {value:3}, {notes:[7], highlights:{cell:'primary'}}, {notes:[7], highlights:{cell:'primary'}}],
      [{value:4}, {value:5}, {value:6}, {value:8}, {value:9}, {value:1}],
      [{notes:[7], highlights:{cell:'primary'}}, {value:3}, {notes:[7], highlights:{cell:'primary'}}, {value:4}, {notes:[7], highlights:{cell:'primary'}}, {notes:[7], highlights:{cell:'primary'}}],
      [{notes:[7], highlights:{cell:'primary'}}, {value:6}, {notes:[7], highlights:{cell:'primary'}}, {value:1}, {notes:[7], highlights:{cell:'primary'}}, {notes:[7], highlights:{cell:'primary'}}],
    ]
  },
  'Skyscraper': {
    title: 'Skyscraper',
    description: "In two columns, a number (e.g., '5') appears twice. If two candidates share a row (the 'base'), the other two are 'rooftops'. You can eliminate '5' from any cell that sees both rooftops.",
    graphic: [
      [{notes: [5], highlights:{cell:'primary'}}, {value:1}, {value:2}, {value:3}],
      [{value:4}, {value:6}, {value:7}, {notes: [5], highlights:{cell:'primary'}}],
      [{value:8}, {value:9}, {value:1}, {value:2}],
      [{notes: [5], highlights:{cell:'primary'}}, {notes: [5,9], highlights:{cell:'secondary', notes:{'5':'elim'}}}, {value:3}, {notes: [5], highlights:{cell:'primary'}}],
    ]
  },
  'Two-String Kite': {
    title: 'Two-String Kite',
    description: "A number (e.g., '9') is a candidate in only two cells of a row, and two cells of a column. If one cell is shared, you can eliminate '9' from the cell that forms a rectangle with the other two ends.",
    graphic: [
      [{value:1}, {notes: [9], highlights:{cell:'primary'}}, {value:2}, {notes: [9], highlights:{cell:'primary'}}],
      [{value:3}, {value:4}, {value:5}, {value:6}],
      [{value:7}, {notes: [8,9], highlights:{cell:'secondary', notes:{'9':'elim'}}}, {value:1}, {notes: [9], highlights:{cell:'primary'}}]
    ]
  },
  'XY-Wing': {
    title: 'XY-Wing',
    description: "A 'pivot' cell (1,2) sees two 'pincer' cells (1,3) and (2,3). The note in common to the pincers ('3') can be eliminated from any cell that sees both pincers.",
    graphic: [
      [{notes: [1,2], highlights:{cell:'primary'}}, {value:4}, {value:5}, {notes: [1,3], highlights:{cell:'primary'}}],
      [{value:6}, {value:7}, {value:8}, {value:9}],
      [{value:2}, {value:1}, {value:3}, {value:4}],
      [{notes: [2,3], highlights:{cell:'primary'}}, {value:5}, {value:6}, {notes: [3,8], highlights:{cell:'secondary', notes:{'3':'elim'}}}]
    ]
  },
  'XYZ-Wing': {
    title: 'XYZ-Wing',
    description: "A 'pivot' cell has three notes (1,2,3). Two 'pincer' cells see it, each sharing one note with the pivot and one note ('3') with each other. '3' can be eliminated from any cell seeing all three.",
    graphic: [
      [{notes: [1,2,3], highlights:{cell:'primary'}}, {value:4}, {value:5}, {notes: [1,3], highlights:{cell:'primary'}}],
      [{value:6}, {value:7}, {value:8}, {value:9}],
      [{value:2}, {value:1}, {value:3}, {value:4}],
      [{notes: [2,3], highlights:{cell:'primary'}}, {value:5}, {value:6}, {notes: [3,8], highlights:{cell:'secondary', notes:{'3':'elim'}}}]
    ]
  },
  'Unique Rectangle': {
    title: 'Unique Rectangle',
    description: "When three corners of a rectangle have the same two notes (e.g., 4 & 8), you can eliminate those notes from the fourth corner to prevent multiple (illegal) solutions.",
    graphic: [
      [{notes: [4,8], highlights:{cell:'primary'}}, {value:1}, {notes: [4,8], highlights:{cell:'primary'}}],
      [{value:2}, {value:3}, {value:5}],
      [{notes: [4,8,9], highlights:{cell:'secondary', notes:{'4':'elim', '8': 'elim'}}}, {value:6}, {notes: [4,8], highlights:{cell:'primary'}}]
    ]
  }
};

const hintTypeMap: { [key: string]: string } = {
  'Naked Single': 'Naked Single',
  'Hidden Single': 'Hidden Single',
  'Naked Pair': 'Naked Pair',
  'Hidden Pair': 'Hidden Pair',
  'Naked Triple': 'Naked Triple',
  'Hidden Triple': 'Hidden Triple',
  'Intersection Removal': 'Pointing',
  'Pointing': 'Pointing',
  'Claiming': 'Claiming',
  'X-Wing': 'X-Wing',
  'Swordfish': 'Swordfish',
  'Jellyfish': 'Jellyfish',
  'Skyscraper': 'Skyscraper',
  'Two-String Kite': 'Two-String Kite',
  'XY-Wing': 'XY-Wing',
  'XYZ-Wing': 'XYZ-Wing',
  'Unique Rectangle': 'Unique Rectangle',
};

export function getTutorialForHint(hintType: string): Tutorial | null {
  if (!hintType) return null;
  const mappedType = hintTypeMap[hintType] || null;
  return mappedType ? tutorialData[mappedType] : null;
}