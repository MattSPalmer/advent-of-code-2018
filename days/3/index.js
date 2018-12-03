const Rx = require("rxjs");
const op = require("rxjs/operators");
const R = require("ramda");

const { readFile$ } = require("../../util");

const hasExactlyN = n =>
  R.pipe(
    R.split(""),
    R.countBy(R.identity),
    R.filter(R.equals(n)),
    R.complement(R.isEmpty)
  );

const countHavingExactlyN = n => R.pipe(
  R.filter(hasExactlyN(n)),
  R.length
);

const output = readFile$(`${__dirname}/input.txt`).pipe(
  op.map(x => x.split("\n")),
  op.map(R.juxt([countHavingExactlyN(2), countHavingExactlyN(3)])),
  op.map(R.apply(R.multiply))
);

module.exports = output;
