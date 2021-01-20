const Ids = require('ids');
const idMaker = new Ids();

const Matcher = require('./matcher');

class Matchmaker {
  constructor() {
    this.queue = {};
    this.handleJoinQueue = this.handleJoinQueue.bind(this);
    this.handleGetMatchers = this.handleGetMatchers.bind(this);
    this.handlePingResult = this.handlePingResult.bind(this);
  }
  createMatcherId() {
    return idMaker.next();
  }

  handleJoinQueue(req, res) {
    // TODO - check if IP already in a queue
    const matcherId = this.createMatcherId();
    const newMatcher = new Matcher(matcherId, req.ip, this.deleteMatcher);
    this.queue.matcherID = newMatcher;

    const respObj = {
      clientMatcherID: newMatcher.matcherId,
    };

    res.json(respObj);
  }

  deleteMatcher(matcherId) {
    console.log('DELETE MATCHER', matcherId);
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

  deleteSelf(matcherId) {
    console.log('MATCHMAKER DELETED MATCHER ', matcherId);
  }
}

module.exports = Matchmaker;
