const Rx = require("rxjs");
const op = require("rxjs/operators");
const R = require("ramda");

const path = require("path");

const { readFile$ } = require("../../util");

const INPUT = path.join(__dirname, "..", "1", "input.txt");

const inputByItem$ = readFile$(INPUT).pipe(
  op.concatMap(x => x.split("\n")),
  op.map(s => Number.parseInt(s))
);

const output = inputByItem$.pipe(
  op.repeat(),
  op.scan((a, b) => a + b, 0),
  op.scan(
    ({ seen }, current) => {
      const seenBefore = seen.has(current);
      return { seen: seen.add(current), current, seenBefore };
    },
    { seen: new Set() }
  ),
  op.concatMap(
    payload => payload.seenBefore ? Rx.of(payload, null) : Rx.of(payload)
  ),
  op.takeWhile(R.complement(R.isNil)),
  op.last(),
  op.map(R.prop("current"))
);

module.exports = output;
