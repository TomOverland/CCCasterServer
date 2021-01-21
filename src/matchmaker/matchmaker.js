const IDs = require('ids');
const IDMaker = new IDs();

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
  createMatcherID() {
    return IDMaker.next();
  }

  handleJoinQueue(req, res) {
    // TODO - check if IP already in a queue
    const matcherID = this.createMatcherID();
    const newMatcher = new Matcher(matcherID, req.ip, this.deleteMatcher);
    this.queue.notLocated.matcherID = newMatcher;

    const respObj = {
      clientMatcherID: newMatcher.matcherID,
      matchers: geolocationIps.geolocationIps,
    };

    res.json(respObj);
  }

  deleteMatcher(matcherID) {
    console.log('DELETE MATCHER', matcherID);
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
    // const mockOpponent = {
    //   matcherID: 'matcherID',
    //   address: 'opponentAddress',
    //   port: '1.2.3.4',
    //   badMatchIDs: [],
    //   timeCreated: '12:00',
    //   isMatchedWith: 'NW-123456',
    // };
    // this.queue.NW['NW-654321'] = mockOpponent;

    // mock user values
    // const mockUser = {
    //   matcherID: 'matcherID',
    //   address: 'address',
    //   port: '1.2.3.4',
    //   badMatchIDs: [],
    //   timeCreated: '12:00',
    //   isMatchedWith: 'NW-654321',
    // };
    // this.queue.NW['NW-123456'] = mockUser;

    // Make API call to handlePingResult with client matcher ID = NW-123456

    // get region queue (first 2 chars of client matcherID)
    const regionQueueArray = clientMatcherID.split('', 2); // returns an array: ['N', 'W']
    const regionQueue = regionQueueArray[0] + regionQueueArray[1];
    // console.log('Region Queue: ', regionQueue);
    // how to tell if player has been claimed as a matcher
    const opponentMatcherID = this.queue[regionQueue][clientMatcherID]
      .isMatchedWith;
    // console.log('opponentMatcherID: ', opponentMatcherID);
    const opponentMatcherAddress = this.queue[regionQueue][opponentMatcherID]
      .address;
    // console.log('opponentMatcherAddress: ', opponentMatcherAddress);
    const opponentMatcherPort = this.queue[regionQueue][opponentMatcherID].port;
    // console.log('opponentMatcherPort: ', opponentMatcherPort);
    if (typeof opponentMatcherID === 'undefined') {
      return;
    }

    const respObj = {
      shouldStartMatch: true,
      matchAddress: opponentMatcherAddress,
      matchPort: opponentMatcherPort,
    };

    res.json(respObj);
  }
}

module.exports = Matchmaker;
