const oh = String.fromCharCode(0x1f6a9);
const go = String.fromCharCode(0x2705);
const no = String.fromCharCode(0x274c);

const formatTime = t => `${(t / 1000).toString().padEnd(5, "0")}s`;

const formatStage = (day, stage) => `${day.padStart(2, " ")}${stage}`;

const formatGuessResult = ({ title, guess, answer, error, runtime = 0 }) => {
  const formattedRuntime = formatTime(runtime);
  switch (true) {
    case Boolean(error):
      return `${title} (${formattedRuntime}) ${oh} ${error}`;
    case answer === guess:
      return `${title} (${formattedRuntime}) ${go} ${guess}`;
    default:
      return `${title} (${formattedRuntime}) ${no} Expected ${answer}, got ${guess}`;
  }
};

module.exports = {
  formatTime,
  formatStage,
  formatGuessResult
};
