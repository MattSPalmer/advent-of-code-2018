/* eslint-disable no-console */
const Rx = require("rxjs");
const op = require("rxjs/operators");
const R = require("ramda");
const path = require("path");

const { readFile$ } = require("../../util");
const { formatGuessResult, formatTime, formatStage } = require("./format");

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const ANSWER_RECORD = path.resolve(PROJECT_ROOT, "confirmed-answers.json");

const timeResult = obs => {
  const start = Date.now();
  return Rx.from(
    obs.toPromise().then(obj => R.merge(obj, { runtime: Date.now() - start }))
  );
};

const myGuessFor = n =>
  Rx.defer(() => {
    const pathToGuess = path.resolve(PROJECT_ROOT, `days/${n}`);
    const obs = require(pathToGuess);
    if (obs instanceof Rx.Observable) return obs;
    const msg = `unable to load observable from '${pathToGuess}', got an instance of ${
      obs.constructor.name
    } instead`;
    return Rx.throwError(new Error(msg));
  }).pipe(
    op.map(guess => ({ guess })),
    op.catchError(({ message }) => Rx.of({ error: message })),
    timeResult
  );

const answerEntries$ = readFile$(ANSWER_RECORD).pipe(
  op.map(JSON.parse),
  op.concatMap(Object.entries),
  op.concatMap(([day, stages]) =>
    Object.entries(stages).map(([k, v]) => [day, k, v])
  ),
  op.toArray(),
  op.concatMap(R.sortBy(R.apply(formatStage)))
);

const report = obs =>
  obs.pipe(
    op.map(R.prop("runtime")),
    op.reduce(R.add, 0),
    op.map(total => `\nTotal runtime: ${formatTime(total)}`)
  );

const runStage = ([day, stage, answer]) => {
  const obs = R.isNil(answer) ? Rx.empty() : myGuessFor(`${day}/${stage}`);
  return obs.pipe(op.map(R.merge({ title: formatStage(day, stage), answer })));
};

const result$ = answerEntries$.pipe(
  op.concatMap(runStage),
  op.share()
);

const output$ = result$.pipe(
  obs => Rx.merge(report(obs), obs.pipe(op.map(formatGuessResult))),
  op.catchError(err => Rx.of(err))
);

output$.subscribe({
  next: console.log,
  error: err => {
    throw err;
  }
});
