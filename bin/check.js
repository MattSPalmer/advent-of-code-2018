const Rx = require("rxjs");
const op = require("rxjs/operators");
const R = require("ramda");

const path = require("path");
const { readFile$ } = require("../util");

const myGuessFor = n =>
  Rx.defer(() => require(`../days/${n}`))
    .pipe(op.catchError(err => Rx.of(err.message)));

const ANSWER_RECORD = path.join(__dirname, "..", "confirmed-answers.json");

const answerEntries$ = readFile$(ANSWER_RECORD).pipe(
  op.map(JSON.parse),
  op.concatMap(Object.entries)
);

answerEntries$
  .pipe(
    op.mergeMap(([day, answer]) =>
      myGuessFor(day).pipe(
        op.map(guess => [Number.parseInt(day), answer, guess])
      )),
    op.toArray(),
    op.concatMap(R.sortBy(R.prop(0)))
  )
  .subscribe(console.log);
