class Matcher {
  constructor(matcherID, address, deleteSelf) {
    this.matcherID = matcherID;
    this.address = address;
    this.port;
    this.badMatchIDs = [];
    this.timeCreated = new Date();
    this.isMatchedWith;
    this.deleteSelf = deleteSelf;
  }
}

module.exports = Matcher;
