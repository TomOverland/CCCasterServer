const Ids = require('ids');
const idMaker = new Ids();
const auth = require('../common/constants/dev-config');
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
    // this.handleJoinQueue = this.handleJoinQueue.bind(this);
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
    // TODO - check if IP already in a queue
    const matcherID = this.createMatcherID();
    ws.matcherID = matcherID;
    this.queue.notLocated[matcherID] = ws;

    console.log(`matcherID is ${ws.matcherID}`);
    const respObj = {
      eventType: 'pingTest',
      matchers: constants.geolocationIps,
    };
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

  handlePingResult(ws, parsedMessage) {
    // console.log('in handle ping result');
    // if (this.isGeolocationResponse(parsedMessage)) {
    //   console.log('is geolocation response');
    //   this.handleGeolocationResponse(parsedMessage, ws);
    // } else {
    // Has Match work goes here
    // Ping Comparison Function work goes here
    // }
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
    if (req.headers.devclientid === auth.devClientID) {
      return res.json(this.queue);
    } else {
      res.status(403);
      res.json('Error: Forbidden')
    }
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

  deleteMatcher(matcherID) {
    console.log('DELETE MATCHER', matcherID);
  }

  updateCheckin() {
    // checkin logic
  }
}

module.exports = Matchmaker;

// handleJoinQueue(req, res) {
//   // TODO - check if IP already in a queue
//   const matcherID = this.createMatcherID();
//   const newMatcher = new Matcher(matcherID, req.ip, this.deleteMatcher);
//   this.queue.notLocated[matcherID] = newMatcher;

//   const respObj = {
//     clientMatcherID: newMatcher.matcherID,
//     matchers: constants.geolocationIps,
//   };

//   res.json(respObj);
// }
