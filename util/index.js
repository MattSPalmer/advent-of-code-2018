const Rx = require("rxjs");
const op = require("rxjs/operators");
const fs = require("fs");

const _readFile$ = Rx.bindNodeCallback(fs.readFile);

const readFile$ = path => {
  return _readFile$(path).pipe(op.map(buf => buf.toString()));
};

const takeWhileInclusive = predicate => {
  const killSignal = Symbol();
  return obs =>
    obs.pipe(
      op.concatMap(val =>
        predicate(val) ? Rx.of(val) : Rx.of(val, killSignal)
      ),
      op.takeWhile(val => val !== killSignal)
    );
};

module.exports = {
  readFile$,
  takeWhileInclusive
};
