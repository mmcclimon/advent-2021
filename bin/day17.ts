const _test = [20, 30, -10, -5];
const target = [201, 230, -99, -65];
// target area: x=20..30, y=-10..-5

const run = (xv: number, yv: number) => {
  let xpos = 0, ypos = 0;

  const ys = [];

  while (true) {
    xpos += xv;
    ypos += yv;
    ys.push(ypos);
    // console.log(xpos, ypos);

    xv += xv > 0 ? -1 : xv < 0 ? 1 : 0;
    yv -= 1;

    if (
      target[0] <= xpos && xpos <= target[1] && target[2] <= ypos &&
      ypos <= target[3]
    ) {
      // console.log("hit");
      return Math.max(...ys);
    }

    if (xpos > target[1] || ypos < target[2]) return;
  }
};

const findBest = () => {
  // find min/max x velocities
  let maxY = 0;
  let best = [0, 0];
  for (let xv = 1; xv <= target[0]; xv++) {
    for (let yv = 1; yv <= target[0]; yv++) {
      const y = run(xv, yv);
      if (y && y > maxY) {
        best = [xv, yv];
        maxY = y;
      }
    }
  }

  console.log(maxY);
};

const findAll = () => {
  let total = 0;
  for (let xv = 1; xv <= target[1]; xv++) {
    for (let yv = target[2]; yv <= target[1]; yv++) {
      const y = run(xv, yv);
      if (typeof y !== "undefined") {
        // console.log(`${xv}, ${yv}`);
        total++;
      }
    }
  }

  console.log(total);
};

findBest();
findAll();
