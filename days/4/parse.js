const a = require("arcsecond");
const R = require("ramda");

const numberAt = n => xs => parseInt(xs[n]);

const getDate = a.pipeParsers([
  a.sepBy(a.anyOfString("- :"))(a.digits),
  a.mapTo(
    R.applySpec({
      month: numberAt(1),
      day: numberAt(2),
      hour: numberAt(3),
      minute: numberAt(4)
    })
  )
]);

const guardDesignation = a.pipeParsers([
  a.sequenceOf([a.str("Guard #"), a.digits, a.char(" ")]),
  a.mapTo(([, id]) => id.padStart(4, "0"))
]);

const betweenBrackets = a.between(a.char("["))(a.char("]"));

const shiftStart = a.pipeParsers([
  a.sequenceOf([
    betweenBrackets(getDate),
    a.char(" "),
    guardDesignation,
    a.str("begins shift\n")
  ]),
  a.mapTo(
    R.applySpec({
      date: R.nth(0),
      id: R.nth(2)
    })
  )
]);

const shiftSleepActivity = a.pipeParsers([
  a.sequenceOf([
    betweenBrackets(getDate),
    a.char(" "),
    a.choice([a.str("falls asleep"), a.str("wakes up")]),
    a.possibly(a.char("\n"))
  ]),
  a.mapTo(R.applySpec({ date: R.nth(0), action: R.nth(2) }))
]);

const formatDate = R.pipe(
  R.props(["month", "day"]),
  R.map(n => n.toString().padStart(2, "0")),
  ([m, d]) => `${m}/${d}`
);

const collectShiftDate = R.ifElse(
  R.propSatisfies(sleepEvents => sleepEvents.length > 0, 1),
  R.pipe(
    R.path([1, 0, "date"]),
    formatDate
  ),
  R.always("N/A")
);

const shiftEntry = a.pipeParsers([
  a.sequenceOf([shiftStart, a.many(shiftSleepActivity)]),
  a.mapTo(
    R.applySpec({
      employeeId: R.path([0, "id"]),
      shiftDate: collectShiftDate,
      sleepEvents: R.prop(1)
    })
  )
]);
const processLogFile = a.many(shiftEntry);

module.exports = string =>
  a
    .parse(processLogFile)(string)
    .cata({
      Left: e => {
        throw e;
      },
      Right: R.identity
    });

// a.parse(processLogLine)(input).cata({
//   Left: err => {
//     console.log(err);
//   },
//   Right: value => {
//     console.log(value);
//   }
// });
