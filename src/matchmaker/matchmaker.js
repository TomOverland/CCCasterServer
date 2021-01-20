const Matcher = require("./matcher");

class Matchmaker {

  constructor() {
    this.deleteSelf;
  }
  init() {}

  handleJoinQueue(req, res) {
    const dummyMatcher = new Matcher('2038u4108', '192.168.0.1', this.deleteSelf)
    dummyMatcher.deleteSelf(dummyMatcher.matcherId)
    const respObj = {
      clientMatcherID: '12345',
    };
    res.json(respObj);
  }

  handleGetMatchers(req, res) {
    const respObj = {
      matchers: [
        {
          matcherID: '11111',
          address: '8.8.8.8',
        },
        {
          matcherID: '22222',
          address: '8.8.8.8',
        },
        {
          matcherID: '33333',
          address: '8.8.8.8',
        },
      ],
    };
    res.json(respObj);
  }

  handlePingResult(req, res) {
    const respObj = {
      shouldStartMatch: true,
      matcherAddress: '192.168.1.1:12345',
    };
    res.json(respObj);
  }

  handlePortOpen(req, res) {
    const respObj = {
      // Empty obj for now, will need to fill in KVP with more info
    };
    res.json(respObj);
  }
  
  deleteSelf(matcherId) {
    console.log('MATCHMAKER DELETED MATCHER ', matcherId);
  }
}

module.exports = Matchmaker;
