const op = require("rxjs/operators");
const R = require("ramda");

const { claimedGrid$, claims$, claimToInches } = require("../");

const isClaimExclusive = (grid, claim) => {
  return claimToInches(claim).every(([x, y]) => grid[y][x] === 1);
};

const output = claimedGrid$.pipe(
  op.concatMap(grid =>
    claims$.pipe(
      op.filter(claim => isClaimExclusive(grid, claim)),
      op.map(R.prop("id"))
    )
  )
);

module.exports = output;
