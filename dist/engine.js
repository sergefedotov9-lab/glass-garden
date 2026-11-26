"use strict";

const gardenEngine = (() => {
  const size = 8;
  const difficulties = {
    easy: { goal: 1600, moves: 30 },
    normal: { goal: 2200, moves: 24 },
    hard: { goal: 2800, moves: 20 }
  };
  const randomBytes = new Uint8Array(1);

  function randomType() {
    do {
      crypto.getRandomValues(randomBytes);
    } while (randomBytes[0] >= 252);
    return randomBytes[0] % 6;
  }

  function matches(board) {
    const matched = new Set();
    for (const stride of [1, size]) {
      const step = stride === 1 ? size : 1;
      for (let line = 0; line < size; line++) {
        let start = 0;
        while (start < size) {
          const type = board[line * step + start * stride];
          let end = start + 1;
          while (end < size && board[line * step + end * stride] === type) end++;
          if (type !== null && end - start >= 3) {
            for (let position = start; position < end; position++) {
              matched.add(line * step + position * stride);
            }
          }
          start = end;
        }
      }
    }
    return matched;
  }

  function swap(board, first, second) {
    [board[first], board[second]] = [board[second], board[first]];
  }

  function matchAt(board, index) {
    const type = board[index];
    const row = Math.floor(index / size);
    const column = index % size;
    for (const [coordinate, stride] of [[column, 1], [row, size]]) {
      let count = 1;
      for (let step = 1; step <= coordinate && board[index - stride * step] === type; step++) count++;
      for (let step = 1; step < size - coordinate && board[index + stride * step] === type; step++) count++;
      if (count >= 3) return true;
    }
    return false;
  }

  function findMove(board) {
    for (let first = 0; first < board.length; first++) {
      const neighbors = [];
      if (first % size < size - 1) neighbors.push(first + 1);
      if (first + size < board.length) neighbors.push(first + size);
      for (const second of neighbors) {
        if (board[first] === board[second]) continue;
        swap(board, first, second);
        const createsMatch = matchAt(board, first) || matchAt(board, second);
        swap(board, first, second);
        if (createsMatch) return [first, second];
      }
    }
    return [];
  }

  function makeGrid() {
    for (;;) {
      const board = [];
      for (let index = 0; index < size * size; index++) {
        let type;
        do {
          type = randomType();
        } while (
          (index % size >= 2 && board[index - 1] === type && board[index - 2] === type) ||
          (index >= size * 2 && board[index - size] === type && board[index - size * 2] === type)
        );
        board.push(type);
      }
      if (findMove(board).length) return board;
    }
  }

  function refill(grid) {
    const falling = [];
    for (let column = 0; column < size; column++) {
      let destination = size - 1;
      for (let row = size - 1; row >= 0; row--) {
        const type = grid[row * size + column];
        if (type === null) continue;
        const index = destination * size + column;
        grid[index] = type;
        if (destination !== row) falling.push([index, destination - row]);
        destination--;
      }
      const drop = destination + 1;
      for (; destination >= 0; destination--) {
        const index = destination * size + column;
        grid[index] = randomType();
        falling.push([index, drop]);
      }
    }
    return falling;
  }

  return { size, difficulties, matches, swap, findMove, makeGrid, refill };
})();

const gardenRoads = (() => {
  const side = 4;
  const lotCount = side * side;
  const price = 120;
  const valid = index => Number.isInteger(index) && index >= 0 && index < lotCount;

  function adjacent(first, second) {
    return valid(first) && valid(second) &&
      Math.abs(Math.floor(first / side) - Math.floor(second / side)) +
      Math.abs(first % side - second % side) === 1;
  }

  function neighbors(lot) {
    return [lot - side, lot - 1, lot + 1, lot + side].filter(index => adjacent(lot, index));
  }

  return {
    side, price, adjacent, neighbors,
    count: 2 * side * (side - 1),
    segment: (first, second) => [Math.min(first, second), Math.max(first, second)]
  };
})();
