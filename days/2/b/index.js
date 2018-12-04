const op = require("rxjs/operators");
const R = require("ramda");
const path = require("path");

const { readFile$ } = require("../../../util");

const INPUT = path.join(__dirname, "..", "input.txt");

const onlyLikeChars = R.pipe(
  // Given two strings to compare, create an array of char pairs
  R.useWith(R.zip, [R.split(""), R.split("")]),
  // Filter out non-matching pairs
  R.filter(R.apply(R.equals)),
  // Keep only the first char of each pair
  R.map(R.prop(0)),
  // Stringify the charlist
  R.join("")
);

const exhaustPairs = ([head, ...sublist]) => {
  if (sublist.length === 1) return [];
  return [...sublist.map(item => [head, item]), ...exhaustPairs(sublist)];
};

const output = readFile$(INPUT).pipe(
  // Convert string to array of lines
  op.map(x => x.split("\n")),
  // Given a list of lines, emit every unique pair of lines
  op.concatMap(exhaustPairs),
  // Transform a pair to a string containing only the chars common to both strings
  op.map(R.apply(onlyLikeChars)),
  // Filter only to strings missing 1 char (all IDs are 26 chars)
  op.filter(chars => chars.length === 25)
);

module.exports = output;
