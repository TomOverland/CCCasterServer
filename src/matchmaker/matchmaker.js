const Ids = require('ids');
const idMaker = new Ids();
const _ = require('lodash');

const Matcher = require('./matcher');
const constants = require('../common/constants/constants');

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
    return idMaker.next();
  }

  handleJoinQueue(req, res) {
    // TODO - check if IP already in a queue
    const matcherID = this.createMatcherID();
    const newMatcher = new Matcher(matcherID, req.ip, this.deleteMatcher);
    this.queue.notLocated[matcherID] = newMatcher;

    const respObj = {
      clientMatcherID: newMatcher.matcherID,
      matchers: constants.geolocationIps,
    };

    res.json(respObj);
  }

  handleGetMatchers(req, res) {
    // Has Match goes here
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
    if (this.isGeolocationResponse(req)) {
      console.log('is geolocation response');
      this.handleGeolocationResponse(req);
    } else {
      // Has Match work goes here
      // Ping Comparison Function work goes here
    }
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

  handleGeolocationResponse(req) {
    const closestRegionCode = this.findClosestRegion(req.body.matchers);
    const newMatcherID = `${closestRegionCode}-${req.body.clientMatcherID}`;
    const clientMatcher = _.clone(this.queue.notLocated[req.body.clientMatcherID]);
    clientMatcher.matcherID = newMatcherID;
    delete this.queue.notLocated[req.body.clientMatcherID];
    this.queue[closestRegionCode][newMatcherID] = clientMatcher;
  }

  isGeolocationResponse(req) {
    return Object.values(req.body.matchers[0]).includes('NorthAmericaWest');
  }

  findClosestRegion(regionPings) {
    let indexOfLowestPing = 0;
    let lowestPing = 1000;
    regionPings.forEach((pingResult) => {
      if (pingResult.pingResult < lowestPing) {
        lowestPing = pingResult.pingResult;
        indexOfLowestPing = regionPings.indexOf(pingResult);
      }
    });
    return constants.regionCodes[regionPings[indexOfLowestPing].matcherID];
  }

  selectMatchers(clientMatcherID, res) {
    // should return an array of three matchers to test
    // selected matchers should not be in the clientMatcher's badMatchIds arr
  }

  deleteMatcher(matcherID) {
    console.log('DELETE MATCHER', matcherID);
  }

  updateCheckin() {
    // checkin logic
  }
}

module.exports = Matchmaker;
