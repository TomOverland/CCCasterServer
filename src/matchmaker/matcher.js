class Matcher {
  constructor(
    matcherId,
    address,
   deleteSelf
  ) {
    this.matcherId = matcherId;
    this.address = address;
    this.port;
    this.badMatchIds = [];
    this.timeCreated = new Date();
    this.deleteSelf = deleteSelf;
    this.isMatchedWith;
  }

}

module.exports = Matcher;
