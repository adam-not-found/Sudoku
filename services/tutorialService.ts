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
      [{ value: 1 }, { notes: [2, 8], highlights: { cell: 'primary' } }, { notes: [2, 8], highlights: { cell: 'primary' } }, { notes: [2, 4, 5], highlights: { notes: { '2': 'elim' } } }, { value: 9 }],
    ],
  },
  'Hidden Pair': {
    title: 'Hidden Pair',
    description: "A 'Hidden Pair' occurs when two notes (e.g., 2 and 8) appear in only two cells within a unit. You can eliminate all other notes from those two cells.",
    graphic: [
      [{ notes: [1, 2, 8], highlights: { cell: 'primary', notes: { '1': 'elim' } } }, { notes: [1, 3, 5] }, { notes: [2, 8], highlights: { cell: 'primary' } }],
      [{ notes: [1, 2] }, { value: 4 }, { value: 6 }],
      [{ notes: [5, 8] }, { value: 7 }, { value: 9 }],
    ],
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
        [{notes: [1,5]}, {notes: [5,8], highlights: {cell: 'primary'}}, {notes: [1,8]}, {notes: [5,9], highlights: {cell: 'primary'}}, {value: 2}],
        [{notes: [2,5], highlights: {cell: 'secondary', notes: {'5': 'elim'}}}, {value: 3}, {value: 4}, {value: 6}, {value: 7}],
        [{notes: [3,5]}, {notes: [5,8], highlights: {cell: 'primary'}}, {notes: [3,8]}, {notes: [5,9], highlights: {cell: 'primary'}}, {value: 1}],
    ]
  }
};

const hintTypeMap: { [key: string]: string } = {
  'Naked Single': 'Naked Single',
  'Hidden Single': 'Hidden Single',
  'Naked Pair': 'Naked Pair',
  'Hidden Pair': 'Hidden Pair',
  'Naked Triple': 'Naked Pair',
  'Hidden Triple': 'Hidden Pair',
  'Intersection Removal': 'Pointing',
  'Pointing': 'Pointing',
  'Claiming': 'Claiming',
  'X-Wing': 'X-Wing',
  'Skyscraper': 'X-Wing',
  'Two-String Kite': 'X-Wing',
  'XY-Wing': 'X-Wing',
  'XYZ-Wing': 'X-Wing',
  'Swordfish': 'X-Wing',
  'Jellyfish': 'X-Wing',
  'Unique Rectangle': 'Naked Pair',
};

export function getTutorialForHint(hintType: string): Tutorial | null {
  if (!hintType) return null;
  const mappedType = hintTypeMap[hintType] || null;
  return mappedType ? tutorialData[mappedType] : null;
}
