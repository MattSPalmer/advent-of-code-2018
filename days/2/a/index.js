const op = require("rxjs/operators");
const R = require("ramda");
const path = require("path");

const { readFile$ } = require("../../../util");

const INPUT = path.join(__dirname, "..", "input.txt");

const hasExactlyN = n =>
  R.pipe(
    R.split(""),
    R.countBy(R.identity),
    R.values,
    R.contains(n)
  );

const countHavingExactlyN = n =>
  R.pipe(
    R.filter(hasExactlyN(n)),
    R.length
  );

const process = R.pipe(
  x => x.split("\n"),
  R.juxt([countHavingExactlyN(2), countHavingExactlyN(3)]),
  R.apply(R.multiply)
);

const output = readFile$(INPUT).pipe(op.map(process));

module.exports = output;
