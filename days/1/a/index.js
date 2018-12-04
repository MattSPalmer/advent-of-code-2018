const op = require("rxjs/operators");
const { readFile$ } = require("../../../util");

const path = require("path");

const INPUT = path.join(__dirname, "..", "input.txt");

module.exports = readFile$(INPUT).pipe(
  // Receiving a string containing a file's content, emit each line
  op.concatMap(x => x.split("\n")),
  // Convert the line into a number
  op.map(s => Number.parseInt(s)),
  // Sum the numbers
  op.reduce((a, b) => a + b, 0)
);
