const op = require("rxjs/operators");
const R = require("ramda");

const { claimedGrid$ } = require("../");

const countGridItemsOfInterest = R.pipe(
  R.flatten,
  R.filter(n => n > 1),
  R.length
);

const output = claimedGrid$.pipe(op.map(countGridItemsOfInterest));

module.exports = output;
