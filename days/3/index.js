const op = require("rxjs/operators");
const R = require("ramda");
const path = require("path");

const { readFile$, makeReplayable } = require("../../util");

const INPUT = path.join(__dirname, "input.txt");
const GRID_SIZE = 1000;

const matchAndParse = pattern =>
  R.pipe(
    s => s.match(pattern),
    R.slice(1, 3),
    R.map(x => Number.parseInt(x))
  );

const processClaimText = R.applySpec({
  id: R.pipe(
    s => s.match(/^#(\d+)/),
    R.nth(1)
  ),
  coordinates: matchAndParse(/(\d+),(\d+)/),
  dimension: matchAndParse(/(\d+)x(\d+)/)
});

const range = R.range(0);
const allPairs = R.lift(R.pair);

const claimToInches = ({ coordinates: [x, y], dimension: [w, h] }) =>
  allPairs(range(w).map(R.add(x)), range(h).map(R.add(y)));

const applyClaims = claims => {
  const grid = R.times(() => new Array(GRID_SIZE).fill(0), GRID_SIZE);
  claims.forEach(claim => {
    claimToInches(claim).forEach(([x, y]) => {
      grid[y][x]++;
    });
  });
  return grid;
};

const claims$ = readFile$(INPUT).pipe(
  op.concatMap(R.split("\n")),
  op.map(processClaimText)
);

const claimedGrid$ = claims$.pipe(
  op.toArray(),
  op.map(applyClaims),
  makeReplayable
);

module.exports = {
  claims$,
  claimedGrid$,
  claimToInches
};
