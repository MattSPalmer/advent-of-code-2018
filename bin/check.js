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
  op.concatMap(Object.entries),
  op.concatMap(([day, { a, b }]) => [[day, "a", a], [day, "b", b]]),
  op.toArray(),
  op.concatMap(R.sortBy(([day, stage]) => [day, stage]))
);

answerEntries$
  .pipe(
    op.concatMap(([day, stage, answer]) =>
      myGuessFor(`${day}/${stage}`).pipe(
        op.map(R.merge({ title: `${day}${stage}`, answer })),
        op.map(item => [ item.title, item.answer, item.guess ])
      )
    )
  )
  .subscribe(console.log);
