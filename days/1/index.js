const Rx = require("rxjs");
const op = require("rxjs/operators");
const { readFile$ } = require("../../util");

module.exports = readFile$(`${__dirname}/input.txt`).pipe(
  op.concatMap(x => x.split("\n")),
  op.map(s => Number.parseInt(s)),
  op.reduce((a, b) => a + b, 0)
);
