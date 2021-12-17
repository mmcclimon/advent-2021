const _test = [20, 30, -10, -5];
const target = [201, 230, -99, -65];
// target area: x=20..30, y=-10..-5

const [xmin, xmax, ymin, ymax] = target;

const run = (xv: number, yv: number) => {
  const ys = [];

  for (
    let xpos = 0, ypos = 0;
    xpos <= xmax && ypos >= ymin;
    xpos += xv, ypos += yv, xv += xv > 0 ? -1 : xv < 0 ? 1 : 0, yv--
  ) {
    ys.push(ypos);

    if (
      xmin <= xpos && xpos <= xmax &&
      ymin <= ypos && ypos <= ymax
    ) {
      // console.log("hit");
      return Math.max(...ys);
    }
  }
};

const findBest = () => {
  let best = 0;

  for (let xv = 1; xv <= xmin; xv++) {
    for (let yv = 1; yv <= xmin; yv++) {
      const y = run(xv, yv);
      if (y && y > best) {
        best = y;
      }
    }
  }

  console.log(best);
};

const findAll = () => {
  let total = 0;

  for (let xv = 1; xv <= xmax; xv++) {
    for (let yv = ymin; yv <= xmax; yv++) {
      const y = run(xv, yv);
      if (typeof y !== "undefined") {
        total++;
      }
    }
  }

  console.log(total);
};

findBest();
findAll();
