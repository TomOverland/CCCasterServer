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
    this.maxPing = 126;
    this.handleJoinQueue = this.handleJoinQueue.bind(this);
    this.handleGetMatchers = this.handleGetMatchers.bind(this);
    this.handlePingResult = this.handlePingResult.bind(this);
    this.deleteMatcher = this.deleteMatcher.bind(this);
    this.handleDumpQueue = this.handleDumpQueue.bind(this);
  }
  createMatcherID() {
    return idMaker.next();
  }

  handleJoinQueue(ws) {
    const matcherID = this.createMatcherID();
    ws.matcherID = matcherID;
    this.queue.notLocated[matcherID] = ws;

    console.log(`NEW MATCHER - matcherID is ${ws.matcherID}`);
    const respObj = {
      eventType: 'pingTest',
      matchers: constants.geolocationIps,
    };
    ws.send(JSON.stringify(respObj));
  }

  handlePingResult(ws, parsedMessage) {
    console.log('in handle ping result');
    if (this.isGeolocationResponse(parsedMessage)) {
      console.log('is geolocation response');
      this.handleGeolocationResponse(parsedMessage, ws);
    } else {
      // Has Match work goes here
      // Ping Comparison Function work goes here
    }
    const respObj = {
      eventType: 'joinMatch',
      matcherAddress: '192.168.1.1',
      matcherPort: '12345',
    };
    // res.json(this.queue);
    ws.send(JSON.stringify(respObj));
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

  handlePortOpen(req, res) {
    const respObj = {
      // if port status is "true", it is open.
      portStatus: true,
    };
    res.json(respObj);
  }

  isMatchedWith(clientMatcherID, res) {
    const regionQueue = clientMatcherID.substring(0, 2);
    const opponentMatcherID = this.queue[regionQueue][clientMatcherID].isMatchedWith;
    if (typeof opponentMatcherID === 'undefined') {
      return;
    }
    const respObj = {
      shouldStartMatch: true,
      matchAddress: this.queue[regionQueue][opponentMatcherID].address,
      matchPort: this.queue[regionQueue][opponentMatcherID].port,
    };

    res.json(respObj);
  }

  handleDumpQueue(req, res) {
    // check req.headers for the presence of the Auth header
    // if Auth header is not present, res.status(403)
    res.json(this.queue);
  }

  handleGeolocationResponse(parsedMessage, ws) {
    const closestRegionCode = this.findClosestRegion(parsedMessage.matchers);
    const newMatcherID = `${closestRegionCode}-${ws.matcherID}`;
    const clientMatcher = _.clone(this.queue.notLocated[ws.matcherID]);
    clientMatcher.matcherID = newMatcherID;
    delete this.queue.notLocated[ws.matcherID];
    this.queue[closestRegionCode][newMatcherID] = clientMatcher;
  }

  isGeolocationResponse(message) {
    console.log('in geolocation response');
    console.log(message.matchers);
    return Object.values(message.matchers[0]).includes('NorthAmericaWest');
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
}

module.exports = Matchmaker;
