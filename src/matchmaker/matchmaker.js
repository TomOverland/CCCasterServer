const Ids = require('ids');
const idMaker = new Ids();
const auth = require('../common/constants/dev-config');
const _ = require('lodash');
const Matcher = require('./matcher');
const constants = require('../common/constants/constants');

class Matchmaker {
  constructor() {
    this.queue = {
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
    this.handlePingResult = this.handlePingResult.bind(this);
    this.handleDumpQueue = this.handleDumpQueue.bind(this);
  }
  createMatcherID() {
    return idMaker.next();
  }

  handleJoinQueue(ws) {
    const matcherID = this.createMatcherID();
    ws.matcherID = matcherID;
    ws.badMatchers = [];
    ws.isMatchedWith = undefined;

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
      const opponent = this.queue[ws.regionQueue][ws.matcherID].isMatchedWith;
      if (opponent) {
        console.log('IN HANDLE PING RESULT - PLAYER HAS BEEN CLAIMED');
        console.log('TERMINATING');
        return; // player has been marked by opponent - that thread will start the match
      }
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

  handlePortOpen(req, res) {
    const respObj = {
      // if port status is "true", it is open.
      portStatus: true,
    };
    res.json(respObj);
  }

  handleDumpQueue(req, res) {
    if (req.headers.devclientid === auth.devClientID) {
      return res.json(this.queue);
    } else {
      res.status(403);
      res.json('Error: Forbidden')
    }
  }

  handleGeolocationResponse(parsedMessage, ws) {
    ws.regionCode = this.findClosestRegion(parsedMessage.matchers);
    this.queue[ws.regionCode][ws.matcherID] = ws;
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
