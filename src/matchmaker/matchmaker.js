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
    this.queue.notLocated.matcherID = newMatcher;

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
    this.isMatchedWith(req.clientMatcherID, res);
    const respObj = {
      shouldStartMatch: true,
      matcherAddress: '192.168.1.1:12345',
    };
    res.json(respObj);
  }

  handlePortOpen(req, res) {
    const respObj = {
      // if port status is "true", it is open.
      portStatus: true,
    };
    res.json(respObj);
  }

  isMatchedWith(clientMatcherID, res) {
    // mock opponent values
    const mockOpponent = {
      matcherId: 'matcherId',
      address: 'address',
      port: '1.2.3.4',
      badMatchIds: [],
      timeCreated: '12:00',
      isMatchedWith: 'NW-123456',
    };
    this.queue.NW['NW-654321'] = mockOpponent;

    // mock user values
    const mockUser = {
      matcherId: 'matcherId',
      address: 'address',
      port: '1.2.3.4',
      badMatchIds: [],
      timeCreated: '12:00',
      isMatchedWith: 'NW-654321',
    };
    this.queue.NW['NW-123456'] = mockUser;

    // Make API call to handlePingResult with client matcher ID = NW-123456

    // get region queue (first 2 chars of client matcherID)
    const regionQueue = clientMatcherID.split('', 2);
    const mockRegionQueue = 'NW';
    console.log('Region Queue: ', regionQueue);
    // how to tell if player has been claimed as a matcher
    const opponentMatcherID = this.queue[mockRegionQueue][clientMatcherID]
      .isMatchedWith;
    if (typeof opponentMatcherID === 'undefined') {
      return;
    }

    // response object
    const respObj = {
      shouldStartMatch: true,
      // dummy matchAddress
      matchAddress: '192.168.1.1:12345',
      // dummy matchPort
      matchPort: '1.2.3.4',
    };

    res.json(respObj);
  }
}

module.exports = Matchmaker;
