"use strict";

const cityArt = (() => {
  const width = 680;
  const height = 450;
  const side = 4;

  function plot(index) {
    const row = Math.floor(index / side);
    const column = index % side;
    return ground(column, row);
  }

  function ground(column, row) {
    return [340 + (column - row) * 69, 188 + (column + row) * 34];
  }

  function shape(ctx, points, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function path(ctx, points, stroke, weight = 1) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = weight;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  function diamond(ctx, x, y, w, h, fill, stroke) {
    shape(ctx, [[x, y - h], [x + w, y], [x, y + h], [x - w, y]], fill, stroke);
  }

  function ellipse(ctx, x, y, w, h, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function gradient(ctx, x, y, nextX, nextY, start, end) {
    const fill = ctx.createLinearGradient(x, y, nextX, nextY);
    fill.addColorStop(0, start);
    fill.addColorStop(1, end);
    return fill;
  }

  function prism(ctx, x, y, w, depth, h, colors) {
    const [left, right, roof] = colors;
    const top = y - h;
    const l = [x - w, top];
    const r = [x + w, top];
    const f = [x, top + depth];
    shape(ctx, [l, f, [x, y + depth], [x - w, y]], left, "#294c4c60");
    shape(ctx, [f, r, [x + w, y], [x, y + depth]], right, "#294c4c60");
    diamond(ctx, x, top, w, depth, roof, "#fafff88f");
    return top;
  }

  function windows(ctx, x, top, w, depth, h, columns, rows, tint) {
    const step = w / columns;
    const spacing = (h - 12) / rows;
    for (const direction of [-1, 1]) {
      for (let column = 0; column < columns; column++) {
        const start = step * (column + .19);
        const end = step * (column + .79);
        for (let row = 0; row < rows; row++) {
          const high = top + depth + 7 + row * spacing;
          const left = high - depth * start / w;
          const right = high - depth * end / w;
          shape(ctx, [[x + direction * start, left], [x + direction * end, right],
            [x + direction * end, right + spacing * .56], [x + direction * start, left + spacing * .56]],
          (column + row) % 5 === 0 ? "#ffe7a9a1" : tint);
        }
      }
    }
  }

  function townhouse(ctx, x, y, w, h, walls, roof) {
    const depth = w * .47;
    const top = prism(ctx, x, y, w, depth, h, walls);
    windows(ctx, x, top, w, depth, h, 2, 2, "#34525ede");
    const ridge = [x - w * .47, top - w * .62];
    shape(ctx, [[x - w, top], ridge, [x + w * .5, top - w * .18], [x, top + depth]], roof, "#6e515b80");
    shape(ctx, [ridge, [x, top - depth], [x + w, top], [x + w * .5, top - w * .18]], "#b97b74", "#6e515b80");
    path(ctx, [ridge, [x + w * .5, top - w * .18]], "#f9d0a4ad", 1.5);
    for (const offset of [.25, .5, .75]) {
      const yShift = w * offset * .57;
      path(ctx, [[x - w + w * offset * .53, top - yShift],
        [x + w * offset * .5, top + depth - w * offset * .65]], "#f5c7a270");
    }
    path(ctx, [[x - w, top + 2], [x, top + depth + 2], [x + w, top + 2]], "#fff0cfb8", 1.5);
    shape(ctx, [[x - w * .56, y - 7 + depth * .56], [x - w * .22, y - 7 + depth * .22],
      [x - w * .22, y + depth * .22], [x - w * .56, y + depth * .56]], "#4c6467", "#fff1d1");
    ctx.fillStyle = "#5a5657";
    ctx.fillRect(x - w * .26, top - w * .74, 4, w * .48);
  }

  function quarter(ctx, x, y) {
    diamond(ctx, x, y - 1, 44, 21, "#dac8a6", "#fff3cf");
    path(ctx, [[x - 39, y + 1], [x, y + 19], [x + 39, y + 1]], "#9f9379");
    townhouse(ctx, x + 12, y - 9, 13, 27, ["#f4d1b2", "#af8779", "#eac6ac"], "#966565");
    townhouse(ctx, x - 17, y - 1, 15, 32, ["#f4e0ae", "#c1a477", "#f4deb0"], "#8e5c5e");
    townhouse(ctx, x + 9, y + 9, 17, 37, ["#e4d6ba", "#a79683", "#f4e3c3"], "#537277");
    tree(ctx, x - 13, y + 14, false, 5);
  }

  function conservatory(ctx, x, y) {
    diamond(ctx, x, y, 43, 21, "#c8d8ab", "#f5edd0");
    const top = prism(ctx, x, y - 3, 29, 14, 23, ["#b9efe0", "#448c85", "#daf8df"]);
    windows(ctx, x, top, 29, 14, 23, 5, 1, "#2c827b9e");
    shape(ctx, [[x - 29, top], [x - 15, top - 22], [x + 14, top - 9], [x, top + 14]], "#b8ead9", "#e9ffe8");
    shape(ctx, [[x - 15, top - 22], [x, top - 34], [x + 29, top], [x + 14, top - 9]], "#72b5a7", "#e9ffe8");
    for (const offset of [6, 12, 18, 24]) {
      path(ctx, [[x - 29 + offset, top + offset * .48], [x - 15 + offset, top - 22 + offset * .48]], "#f4ffead0");
      path(ctx, [[x + offset, top + 14 - offset * .48], [x + 14 + offset * .37, top - 9 - offset * .49]], "#e5fff0b5");
    }
    path(ctx, [[x - 15, top - 22], [x + 14, top - 9]], "#fcfff1", 1.7);
    path(ctx, [[x - 22, top - 11], [x + 7, top + 3]], "#ebffefb5");
    for (const offset of [-32, 33]) tree(ctx, x + offset, y + 4, false, 6);
  }

  function tower(ctx, x, y, tall) {
    const w = tall ? 28 : 25;
    const h = tall ? 132 : 87;
    const depth = w * .52;
    prism(ctx, x, y + 5, w + 11, depth + 6, 5, ["#b5c6bc", "#6e9690", "#eaf0d9"]);
    prism(ctx, x, y + 2, w + 7, depth + 4, 12, ["#d6dbcb", "#8aaca6", "#f1eee0"]);
    const top = prism(ctx, x, y - 3, w, depth, h, [
      gradient(ctx, x - w, y, x, y - h, "#507e92", "#c1eff1"),
      gradient(ctx, x, y, x + w, y - h, "#2d5d76", "#74bfc7"),
      "#cceef3"
    ]);
    windows(ctx, x, top, w, depth, h, 5, tall ? 13 : 8, "#d2fcff91");
    for (let floor = 15; floor < h; floor += 15) {
      path(ctx, [[x - w, top + floor], [x, top + floor + depth], [x + w, top + floor]], "#e1fbef58");
    }
    for (const ratio of [.25, .5, .75]) {
      for (const face of [-1, 1]) {
        const [paneX, paneY] = [x + w * ratio * face, top + depth * (1 - ratio)];
        path(ctx, [[paneX, paneY], [paneX, paneY + h]], "#3d718366");
      }
    }
    shape(ctx, [[x - w + 3, top + 3], [x - w + 8, top + 6], [x - w + 17, y - h * .45],
      [x - w + 11, y - h * .49]], "#e5fff961");
    path(ctx, [[x, top + depth], [x, y - 3 + depth]], "#f1fff5", 1.8);
    path(ctx, [[x - w + 4, top + 2], [x - w + 4, y - 2]], "#e0faf5b0", 1.2);
    if (tall) {
      const tip = [x + 2, top - 35];
      shape(ctx, [[x - w, top], tip, [x, top + depth]], "#d6faf5", "#ecfffb");
      shape(ctx, [tip, [x + w, top], [x, top + depth]], "#77bfcb", "#c4f2ef");
      path(ctx, [tip, [x - 12, top + depth * .6]], "#f3fffcd0");
      path(ctx, [tip, [x + 12, top + depth * .58]], "#b5f4f3");
      path(ctx, [tip, [tip[0], tip[1] - 9]], "#e7fbef");
    } else {
      diamond(ctx, x, top - 2, w * .61, depth * .57, "#88c9bc", "#edfff7");
      diamond(ctx, x, top - 4, w * .32, depth * .34, "#bbeddf", "#f0ffec");
    }
    shape(ctx, [[x, y - 8], [x + 10, y - 13], [x + 10, y + 7], [x, y + 12]], "#4f8089", "#def6ea");
  }

  function tree(ctx, x, y, dark, size = 9) {
    ellipse(ctx, x + size * .48, y + 1, size * .83, size * .31, "#193e3d40");
    path(ctx, [[x, y], [x, y - size]], dark ? "#739481" : "#7a7852", 1.4);
    ellipse(ctx, x, y - size, size * .64, size * .81, dark ? "#356956" : "#689b66");
    ellipse(ctx, x - size * .24, y - size * 1.18, size * .36, size * .47, dark ? "#568d70" : "#9abf80");
    ellipse(ctx, x + size * .04, y - size * 1.48, size * .38, size * .37, dark ? "#679f79" : "#b6ce8c");
    ellipse(ctx, x + size * .23, y - size * .64, size * .31, size * .32, dark ? "#407960" : "#77a56c");
  }

  function building(ctx, type, x, y) {
    switch (type) {
      case "quarter": quarter(ctx, x, y); break;
      case "conservatory": conservatory(ctx, x, y); break;
      case "tower": tower(ctx, x, y, false); break;
      case "skyline": tower(ctx, x, y, true); break;
    }
  }

  function lamp(ctx, x, y, dark, scale = 1) {
    const top = y - 11 * scale;
    const metal = dark ? "#adc0b0" : "#44675b";
    ellipse(ctx, x + 1, y, 3 * scale, 1.4 * scale, "#193c3e57");
    path(ctx, [[x, y], [x, top], [x + 3 * scale, top - 1]], metal);
    ellipse(ctx, x + 3 * scale, top, 1.7 * scale, 2.1 * scale, dark ? "#ffe7a4" : "#ffffdf");
  }

  function stoneEdge(ctx, points, dark) {
    const mortar = dark ? "#465c54" : "#a28c74";
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1];
      const [bx, by] = points[i];
      const steps = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 11));
      shape(ctx, [[ax, ay], [bx, by], [bx, by + 6], [ax, ay + 6]], dark ? "#5c7064" : "#b4a48b", mortar);
      for (let index = 1; index < steps; index++) {
        const x = ax + (bx - ax) * index / steps;
        const y = ay + (by - ay) * index / steps;
        path(ctx, [[x, y], [x, y + 6]], mortar);
      }
      path(ctx, [[ax, ay], [bx, by]], dark ? "#a6b4a2" : "#f4e8ce", 1.25);
    }
  }

  function bridge(ctx, dark) {
    ctx.save();
    ctx.translate(275, 63);
    ctx.rotate(.89);
    ellipse(ctx, 51, 7, 46, 10, "#143f5037");
    ctx.fillStyle = dark ? "#526d65" : "#a39b84";
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(105, 3);
    ctx.lineTo(105, 11);
    ctx.lineTo(93, 11);
    ctx.quadraticCurveTo(82, -1, 70, 11);
    ctx.lineTo(65, 11);
    ctx.quadraticCurveTo(53, -1, 41, 11);
    ctx.lineTo(35, 11);
    ctx.quadraticCurveTo(23, -1, 11, 11);
    ctx.lineTo(0, 11);
    ctx.closePath();
    ctx.fill();
    const deck = dark ? "#a4aaa0" : "#e9dbbe";
    shape(ctx, [[0, -6], [104, -6], [106, 4], [0, 4]], deck);
    for (let stone = 8; stone < 103; stone += 8) path(ctx, [[stone, -5], [stone + 1, 4]], dark ? "#748b81" : "#b4ab91");
    path(ctx, [[0, -7], [105, -7]], dark ? "#ccd3be" : "#fff6d8", 2);
    path(ctx, [[0, 4], [105, 4]], dark ? "#cad1b8" : "#fdf0d3", 2);
    for (const x of [5, 34, 68, 99]) {
      ellipse(ctx, x, -8, 2, 2, dark ? "#e5c98b" : "#f5ebcc");
    }
    ctx.restore();
  }

  function boat(ctx, x, y, angle, dark, sail) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    path(ctx, [[-27, -4], [-12, -1]], dark ? "#b9e2e14f" : "#f5fff188");
    path(ctx, [[-29, 4], [-11, 2]], dark ? "#b9e2e137" : "#f5fff15c");
    ellipse(ctx, 1, 5, 16, 4, "#2a525651");
    shape(ctx, [[-13, -3], [9, -4], [15, 0], [8, 4], [-12, 3]], "#a47c55", "#eff5dd");
    shape(ctx, [[-9, -1], [7, -2], [10, 0], [6, 2], [-9, 1]], "#e1cda0");
    if (sail) {
      ctx.rotate(-angle);
      shape(ctx, [[-1, -2], [-1, -21], [10, -4]], "#f8edcd", "#fff7d9");
      path(ctx, [[-2, 0], [-2, -22]], "#9a8061");
    }
    ctx.restore();
  }

  function waterfront(ctx, dark) {
    const shore = [[0, 0], [314, 0], [307, 40], [266, 74], [218, 74], [175, 98], [121, 96], [61, 123], [0, 102]];
    shape(ctx, shore, gradient(ctx, 15, 0, 235, 100, dark ? "#293c3e" : "#bad3a2", dark ? "#375f50" : "#89ac79"));
    const shoreline = shore.slice(1);
    stoneEdge(ctx, shoreline, dark);
    path(ctx, [[0, 92], [62, 112], [119, 85], [174, 87], [218, 64], [263, 64], [300, 35], [305, 0]], dark ? "#8e9480" : "#e0cfab", 5);
    const trees = [[20, 59, 15], [45, 83, 13], [66, 58, 13], [98, 73, 15],
      [120, 49, 11], [152, 62, 14], [173, 41, 12], [191, 56, 12], [232, 34, 9], [280, 31, 12]];
    for (const [x, y, size] of trees) tree(ctx, x, y, dark, size);
    for (const [x, y] of [[33, 103], [85, 103], [147, 86], [222, 65], [272, 57]]) lamp(ctx, x, y, dark, .85);
    diamond(ctx, 241, 58, 18, 8, dark ? "#b0b399" : "#e4d7aa");
    ellipse(ctx, 241, 56, 8, 4, dark ? "#6caca9" : "#8fcccc");
    path(ctx, [[241, 57], [241, 50]], "#d6f8ed");
    bridge(ctx, dark);
  }

  function landing(ctx, dark) {
    const bank = [[522, 0], [680, 0], [680, 88], [636, 73], [602, 74], [553, 45]];
    shape(ctx, bank, dark ? "#406354" : "#a7bc87");
    stoneEdge(ctx, [[522, 0], [553, 45], [602, 74], [636, 73], [680, 88]], dark);
    path(ctx, [[544, 0], [565, 37], [604, 60], [636, 59], [680, 76]], dark ? "#919887" : "#e3d4af", 5);
    for (const [x, y] of [[560, 12], [585, 34], [606, 27], [642, 26], [658, 45], [672, 39]]) {
      tree(ctx, x, y, dark, 10);
    }
    const deck = [[621, 72], [635, 72], [635, 107], [628, 112], [621, 108]];
    shape(ctx, deck, dark ? "#7f8777" : "#bf9c74", dark ? "#a0a99a" : "#e5d6b3");
    for (let board = 76; board <= 105; board += 5) {
      path(ctx, [[622, board], [634, board]], dark ? "#5b7269" : "#947955");
    }
    for (const x of [620, 635]) {
      path(ctx, [[x, 112], [x, 102]], dark ? "#a6b5a3" : "#7e705a", 2);
    }
    lamp(ctx, 608, 63, dark, .85);
    lamp(ctx, 655, 67, dark, .85);
  }

  function paving(ctx, dark) {
    const lighter = dark ? "#99a48b" : "#ecdfbc";
    const grout = dark ? "#3d584b" : "#a5a17e";
    for (let row = -.5; row <= 3.5; row++) {
      const start = ground(-.5, row);
      const end = ground(3.5, row);
      path(ctx, [start, end], lighter, 3);
      path(ctx, [ground(row, -.5), ground(row, 3.5)], lighter, 3);
      for (let stone = 0; stone <= 25; stone++) {
        const distance = -.5 + stone * .16;
        path(ctx, [ground(distance, row - .04), ground(distance, row + .04)], grout);
        path(ctx, [ground(row - .04, distance), ground(row + .04, distance)], grout);
      }
    }
  }

  function promenade(ctx, dark) {
    const edge = [[49, 290], [340, 436], [631, 290]];
    stoneEdge(ctx, edge, dark);
    for (let i = 0; i <= 8; i++) {
      const inset = i * 32;
      lamp(ctx, 57 + inset, 291 + inset * .5, dark, .65);
      lamp(ctx, 623 - inset, 291 + inset * .5, dark, .65);
    }
    lamp(ctx, 340, 432, dark);
  }

  function road(ctx, [first, second], dark, preview = false) {
    const col = first % side;
    const row = Math.floor(first / side);
    const points = second - first === 1
      ? [ground(col + .5, row - .5), ground(col + .5, row + .5)]
      : [ground(col - .5, row + .5), ground(col + .5, row + .5)];
    ctx.save();
    ctx.lineCap = "round";
    if (preview) ctx.setLineDash([7, 4]);
    path(ctx, points, preview ? "#ffe5a4" : (dark ? "#c0dad1" : "#f9edca"), preview ? 6 : 11);
    if (!preview) {
      path(ctx, points, dark ? "#2a505a" : "#5a746e", 8);
      ctx.setLineDash([6, 4]);
      path(ctx, points, "#f8df9f", 1.25);
    }
    ctx.restore();
  }

  function map(canvas, lots, selected, dark, roads = [], roadPreview = null) {
    const ctx = canvas.getContext("2d");
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.fillStyle = gradient(ctx, 30, 0, width, height, dark ? "#274f56" : "#c8e3d9", dark ? "#122d3b" : "#629cad");
    ctx.fillRect(0, 0, width, height);
    for (let index = 0; index < 105; index++) {
      const x = (index * 137.63 + 11) % width;
      const y = (index * 47.93 + 21) % height;
      const length = 4 + index % 7 * 4;
      path(ctx, [[x, y], [x + length, y], [x + length + 2, y - 1]], dark ? "#9dd5d52b" : "#e6fff372");
    }
    waterfront(ctx, dark);
    landing(ctx, dark);
    boat(ctx, 177, 172, -.24, dark, true);
    boat(ctx, 557, 135, .23, dark, false);
    boat(ctx, 572, 392, -.31, dark, true);
    path(ctx, [[43, 300], [340, 447], [637, 300]], dark ? "#8dc8ca40" : "#e6fff370");
    diamond(ctx, 340, 297, 291, 146, dark ? "#25463f" : "#658e7d", dark ? "#4c756c" : "#d5e8cb");
    diamond(ctx, 340, 290, 291, 146, dark ? "#72877a" : "#d6d2ac", dark ? "#a0b3a3" : "#fbf0ce");
    diamond(ctx, 340, 290, 278, 137, dark ? "#587062" : "#cbbf9c", dark ? "#8f9c87" : "#f0e6c9");
    paving(ctx, dark);
    promenade(ctx, dark);
    for (let index = 0; index < side * side; index++) {
      const [x, y] = plot(index);
      const chosen = index === selected || roadPreview?.includes(index);
      const fill = chosen ? (dark ? "#8a9761" : "#e9df9f") :
        gradient(ctx, x - 52, y - 20, x + 52, y + 20, dark ? "#527c62" : "#ccdbac", dark ? "#385f52" : "#aebf8e");
      diamond(ctx, x, y, 63, 29, fill, chosen ? "#fff3b8" : (dark ? "#809887" : "#f2edcb"));
      if (!chosen) diamond(ctx, x, y, 53, 23, "#80ab6850", dark ? "#9dbaa34a" : "#e5e9bfbd");
      path(ctx, [[x - 49, y + 6], [x, y + 29], [x + 49, y + 6]], dark ? "#183b3980" : "#6b956a70");
      for (const dx of [-23, -16, 17, 24]) {
        ellipse(ctx, x + dx, y + 14 - Math.abs(dx) * .43, 2.7, 1.3, dark ? "#9dac7a" : "#e6deb0");
      }
    }

    for (const segment of roads) road(ctx, segment, dark);
    if (roadPreview && !roads.some(([from, to]) => from === roadPreview[0] && to === roadPreview[1])) {
      road(ctx, roadPreview, dark, true);
    }
    for (let diagonal = 0; diagonal <= 2 * (side - 1); diagonal++) {
      for (let row = 0; row < side; row++) {
        const column = diagonal - row;
        if (column < 0 || column >= side) continue;
        const index = row * side + column;
        const [x, y] = plot(index);
        if (lots[index]) {
          ellipse(ctx, x + 8, y + 8, 40, 14, "#18383a45");
          building(ctx, lots[index], x, y - 2);
        } else {
          tree(ctx, x - 39, y + 2, dark, 8);
          tree(ctx, x + 36, y + 3, dark, 7);
          ellipse(ctx, x, y + 2, 12, 9, "#eff9dee6");
          ctx.fillStyle = "#163b2b";
          ctx.font = "650 13px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(index + 1, x, y + 2);
        }
      }
    }
  }

  function icon(canvas, type) {
    const ctx = canvas.getContext("2d");
    const scale = { quarter: .67, conservatory: .67, tower: .57, skyline: .39 }[type];
    ctx.setTransform(scale, 0, 0, scale, 36, 65);
    building(ctx, type, 0, 0);
  }

  return { width, height, plot, map, icon };
})();
