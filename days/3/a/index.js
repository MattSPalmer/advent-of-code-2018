const op = require("rxjs/operators");
const R = require("ramda");
const path = require("path");

const { readFile$ } = require("../../../util");

const INPUT = path.join(__dirname, "..", "input.txt");

const processClaimText = R.pipe(
  R.match(/(\d+)[,x](\d+)/g),
  ([coord, dim]) => {
    const [x, y] = coord.split(",").map(x => Number.parseInt(x));
    const [w, h] = dim.split("x").map(x => Number.parseInt(x));
    return { x, y, w, h };
  }
);

const range = R.range(0);
const pairUp = R.lift(R.pair);

const claimToInches = ({ x, y, w, h }) =>
  pairUp(range(w).map(R.add(x)), range(h).map(R.add(y)));

const addOne = R.pipe(
  R.defaultTo(0),
  R.inc
);

const claimInchOnGrid = (grid, inch) => {
  const lens = R.lensPath(inch);
  return R.over(lens, addOne, grid);
};

const countGridItemsOfInterest = R.pipe(
  R.flatten,
  R.filter(n => n > 1),
  R.length
);

const output = readFile$(INPUT).pipe(
  op.concatMap(x => x.split("\n")),
  op.map(processClaimText),
  op.reduce((grid, claim) => {
    const inches = claimToInches(claim);
    return R.reduce(claimInchOnGrid, grid, inches);
  }, []),
  op.map(countGridItemsOfInterest)
);

module.exports = output;
