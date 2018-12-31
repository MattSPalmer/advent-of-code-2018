const op = require("rxjs/operators");
const R = require("ramda");
const path = require("path");

const { readFile$ } = require("../../util");

const parseLogFile = require("./parse");

const INPUT = path.join(__dirname, "input.txt");

const expandMinuteRange = R.pipe(
  R.apply(R.range),
  rng => {
    const out = new Array(60).fill(false);
    rng.forEach(min => {
      out[min] = true;
    });
    return out;
  }
);

const shiftSleep = R.pipe(
  R.map(R.path(["date", "minute"])),
  R.splitEvery(2),
  R.map(expandMinuteRange),
  R.reduce(R.zipWith(R.or), R.times(R.F, 60))
);

const renderShift = R.pipe(
  R.evolve({
    sleep: R.pipe(
      R.map(x => (x ? "X" : " ")),
      R.join("")
    )
  }),
  ({ employeeId, shiftDate, sleep }) => `${shiftDate}, ${employeeId}: ${sleep}`
);

const sortLines = R.pipe(
  R.split("\n"),
  R.sortBy(R.identity),
  R.join("\n"),
  R.trim
);

const processFile = R.pipe(
  sortLines,
  parseLogFile,
  R.filter(R.complement(R.propEq("date", "N/A"))),
  R.map(R.evolve({ sleepEvents: shiftSleep }))
);

const indexedMinutes = arr => arr.map((m, i) => [i, m]);

const countSleepMinutes = R.pipe(
  R.map(R.last),
  R.filter(R.identity),
  R.length
);

const sleepiestShiftMinute = R.pipe(
  R.map(R.prop("sleepEvents")),
  R.map(indexedMinutes),
  R.unnest,
  R.groupBy(R.prop(0)),
  R.map(countSleepMinutes)
);

const sleepiestGuard = R.pipe(
  processFile,
  R.groupBy(R.prop("employeeId")),
  R.map(sleepiestShiftMinute),
  R.toPairs
);

const output = readFile$(INPUT).pipe(
  op.concatMap(sleepiestGuard)
);

module.exports = output;

output.subscribe({
  next: console.log,
  error(e) {
    throw e;
  }
});
