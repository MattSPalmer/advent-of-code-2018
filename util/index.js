const Rx = require("rxjs");
const op = require("rxjs/operators");
const fs = require("fs");

const _readFile$ = Rx.bindNodeCallback(fs.readFile);

const readFile$ = path => {
  return _readFile$(path).pipe(op.map(buf => buf.toString()));
};

module.exports = {
  readFile$
};
