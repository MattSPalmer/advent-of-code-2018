const Rx = require("rxjs");
const op = require("rxjs/operators");
const fs = require("fs");
const PNG = require("pngjs-image");

const _readFile$ = Rx.bindNodeCallback(fs.readFile);

const readFile$ = path => {
  return _readFile$(path).pipe(op.map(buf => buf.toString()));
};

const makeReplayable = obs => {
  const subject = new Rx.ReplaySubject();
  obs.subscribe(subject);
  return Rx.from(subject);
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

const makeImage$ = path => pixels =>
  new Rx.Observable(observer => {
    const image = PNG.createImage(pixels.length, pixels[0].length);
    const color = { red: 0, green: 0, blue: 0, alpha: 255 };
    pixels.forEach((row, rowIndex) => {
      row.forEach((pixel, columnIndex) => {
        if (pixel > 0) {
          image.setAt(rowIndex, columnIndex, color);
        }
      });
    });
    image.writeImage(path, err => {
      if (err) {
        observer.error(err);
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  });

module.exports = {
  readFile$,
  makeImage$,
  makeReplayable,
  takeWhileInclusive
};
