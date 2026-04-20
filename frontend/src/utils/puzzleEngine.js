// Akari Puzzle Engine - Core game logic

const CONFIGS = {
  easy:   { rows: 6, cols: 6 },
  medium: { rows: 8, cols: 8 },
  hard:   { rows: 10, cols: 10 },
  daily:  { rows: 8, cols: 8 }
};

function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function getDailySeed() {
  const d = new Date().toISOString().split('T')[0].replace(/-/g,'');
  return parseInt(d) % 999999;
}

function generatePuzzle(rows, cols, diff, seed) {
  const rng = seed !== undefined ? seedRng(seed) : seedRng(Math.floor(Math.random()*999999));
  const density = diff === 'easy' ? 0.18 : diff === 'medium' ? 0.22 : 0.26;
  const blacks = [];
  const isBlack = Array.from({length:rows},()=>Array(cols).fill(false));

  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    if (rng() < density) { isBlack[r][c] = true; blacks.push([r,c]); }
  }

  const bulbs = Array.from({length:rows},()=>Array(cols).fill(false));
  const lit = Array.from({length:rows},()=>Array(cols).fill(false));

  function illuminate(r,c) {
    for (let dc=1; c+dc<cols && !isBlack[r][c+dc]; dc++) lit[r][c+dc]=true;
    for (let dc=1; c-dc>=0 && !isBlack[r][c-dc]; dc++) lit[r][c-dc]=true;
    for (let dr=1; r+dr<rows && !isBlack[r+dr][c]; dr++) lit[r+dr][c]=true;
    for (let dr=1; r-dr>=0 && !isBlack[r-dr][c]; dr++) lit[r-dr][c]=true;
    lit[r][c]=true;
  }

  const whites = [];
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) if (!isBlack[r][c]) whites.push([r,c]);
  for (let i=whites.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[whites[i],whites[j]]=[whites[j],whites[i]];}

  function conflictsWithBulb(r,c) {
    for (let dc=1;c+dc<cols&&!isBlack[r][c+dc];dc++) if(bulbs[r][c+dc]) return true;
    for (let dc=1;c-dc>=0&&!isBlack[r][c-dc];dc++) if(bulbs[r][c-dc]) return true;
    for (let dr=1;r+dr<rows&&!isBlack[r+dr][c];dr++) if(bulbs[r+dr][c]) return true;
    for (let dr=1;r-dr>=0&&!isBlack[r-dr][c];dr++) if(bulbs[r-dr][c]) return true;
    return false;
  }

  for (const [r,c] of whites) {
    if (!lit[r][c] && !conflictsWithBulb(r,c)) { bulbs[r][c]=true; illuminate(r,c); }
  }

  const nums = Array.from({length:rows},()=>Array(cols).fill(-1));
  for (const [r,c] of blacks) {
    let n=0;
    if(r>0&&bulbs[r-1][c]) n++;
    if(r<rows-1&&bulbs[r+1][c]) n++;
    if(c>0&&bulbs[r][c-1]) n++;
    if(c<cols-1&&bulbs[r][c+1]) n++;
    const showNum = diff === 'easy' ? rng()<0.7 : diff === 'medium' ? rng()<0.55 : rng()<0.4;
    if (showNum) nums[r][c] = n;
  }

  // Count total bulbs in solution for max lamps
  let totalBulbs = 0;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) if (bulbs[r][c]) totalBulbs++;

  return { rows, cols, isBlack, nums, solution: bulbs, maxLamps: totalBulbs };
}

function generateRegionalPuzzle(rows, cols) {
  const rng = seedRng(Math.floor(Math.random()*999999));
  const base = generatePuzzle(rows, cols, 'medium', Math.floor(rng()*999999));
  const regions = Array.from({length:rows},()=>Array(cols).fill(-1));
  let regionId = 0;
  for (let r=0; r<rows; r+=2) for (let c=0; c<cols; c+=2) {
    for (let dr=0; dr<2 && r+dr<rows; dr++) for (let dc=0; dc<2 && c+dc<cols; dc++) {
      if (!base.isBlack[r+dr][c+dc]) regions[r+dr][c+dc] = regionId;
    }
    regionId++;
  }
  return { ...base, regions, mode: 'regional' };
}

function generateColorPuzzle(rows, cols) {
  const rng = seedRng(Math.floor(Math.random()*999999));
  const base = generatePuzzle(rows, cols, 'medium', Math.floor(rng()*999999));
  const colors = Array.from({length:rows},()=>Array(cols).fill(0));
  let colorIdx = 1;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    if (base.solution[r][c]) { colors[r][c] = colorIdx; colorIdx = (colorIdx % 4) + 1; }
  }
  return { ...base, bulbColors: colors, mode: 'color' };
}

function computeLitMap(puzzle, solution) {
  const {rows, cols, isBlack, bulbColors} = puzzle;
  const litMap = Array.from({length:rows},()=>Array(cols).fill(false));
  const litColor = Array.from({length:rows},()=>Array(cols).fill(0));
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    if (solution[r][c] === 1) {
      const col = (bulbColors && bulbColors[r][c]) || 1;
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      litMap[r][c]=true; litColor[r][c]=col;
      for (const [dr,dc] of dirs) {
        let nr=r+dr, nc=c+dc;
        while(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!isBlack[nr][nc]) {
          litMap[nr][nc]=true;
          if(!litColor[nr][nc]) litColor[nr][nc]=col;
          nr+=dr; nc+=dc;
        }
      }
    }
  }
  return { litMap, litColor };
}

function findErrors(puzzle, solution) {
  if (!puzzle || !solution) return [];
  const {rows,cols,isBlack,nums,mode,bulbColors} = puzzle;
  const errors = [];
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    if (solution[r][c]!==1) continue;
    const col1 = (bulbColors&&bulbColors[r][c])||1;
    const dirs=[[0,1],[0,-1],[1,0],[-1,0]];
    for (const [dr,dc] of dirs) {
      let nr=r+dr,nc=c+dc;
      while(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!isBlack[nr][nc]) {
        if (solution[nr][nc]===1) {
          const col2=(bulbColors&&bulbColors[nr][nc])||1;
          if (mode!=='color'||col1===col2) { errors.push([r,c],[nr,nc]); }
        }
        nr+=dr; nc+=dc;
      }
    }
  }
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    if (!isBlack[r][c]||nums[r][c]<0) continue;
    let adj=0;
    if(r>0&&solution[r-1][c]===1) adj++;
    if(r<rows-1&&solution[r+1][c]===1) adj++;
    if(c>0&&solution[r][c-1]===1) adj++;
    if(c<cols-1&&solution[r][c+1]===1) adj++;
    if (adj!==nums[r][c]) errors.push([r,c]);
  }
  return errors;
}

function isWon(puzzle, solution) {
  const {rows,cols,isBlack} = puzzle;
  const { litMap } = computeLitMap(puzzle, solution);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(!isBlack[r][c]&&!litMap[r][c]) return false;
  return findErrors(puzzle, solution).length===0;
}

function countBulbs(solution) {
  let count = 0;
  for (let r=0; r<solution.length; r++) for (let c=0; c<solution[0].length; c++) {
    if (solution[r][c] === 1) count++;
  }
  return count;
}

export {
  CONFIGS, generatePuzzle, generateRegionalPuzzle, generateColorPuzzle,
  computeLitMap, findErrors, isWon, getDailySeed, countBulbs
};
