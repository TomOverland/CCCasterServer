const Ids = require('ids');
const idMaker = new Ids();

const Matcher = require('./matcher');
const geolocationIps = require('../common/constants/constants');

class Matchmaker {
  constructor() {
    this.queue = {
      notLocated: {},
      NW: {}, // North America West
      NE: {}, // North America East
      SA: {}, // Sourth America
      EU: {}, // Europe
      ME: {}, // Middle East (Israel)
      JP: {}, // Japan
      AU: {}, // Australia
    };
    this.queue;
    this.handleJoinQueue = this.handleJoinQueue.bind(this);
    this.handleGetMatchers = this.handleGetMatchers.bind(this);
    this.handlePingResult = this.handlePingResult.bind(this);
    this.deleteMatcher = this.deleteMatcher.bind(this);
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
      matchers: geolocationIps.geolocationIps,
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

  handlePortOpen(req, res) {
    const respObj = {
      // Empty obj for now, will need to fill in KVP with more info
    };
    res.json(respObj);
  }
}

module.exports = Matchmaker;
