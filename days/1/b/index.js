const op = require("rxjs/operators");
const R = require("ramda");

const path = require("path");

const { readFile$, takeWhileInclusive } = require("../../../util");

const INPUT = path.join(__dirname, "..", "input.txt");

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
  takeWhileInclusive(payload => !payload.seenBefore),
  op.last(),
  op.map(R.prop("current"))
);

module.exports = output;
