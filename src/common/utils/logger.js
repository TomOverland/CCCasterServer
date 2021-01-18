const logWithStamp = (message) => {
  const timestamp = new Date();
  console.log(message, '\n', timestamp);
};

module.exports = logWithStamp;
