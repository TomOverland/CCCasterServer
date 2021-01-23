const Ids = require('ids');
const idMaker = new Ids();
// const auth = require('../common/constants/dev-config');
const _ = require('lodash');
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
    this.maxPing = 126;
    this.handleJoinQueue = this.handleJoinQueue.bind(this);
    this.handlePingResult = this.handlePingResult.bind(this);
    this.handleDumpQueue = this.handleDumpQueue.bind(this);
    this.handlePortIsOpen = this.handlePortIsOpen.bind(this);
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
      this.selectPlayerToTest(ws);
    } else {
      const opponent = this.queue[ws.regionQueue][ws.matcherID].isMatchedWith;
      if (opponent) {
        console.log('IN HANDLE PING RESULT - PLAYER HAS BEEN CLAIMED');
        console.log('TERMINATING');
        return; // player has been marked by opponent - that thread will start the match
      }
      // Ping Comparison Function work goes here
      evaluateOpponentPingResult(parsedMessage, ws);
    }

    // const respObj = {
    //   eventType: 'joinMatch',
    //   matcherAddress: '192.168.1.1',
    //   matcherPort: '12345',
    // };
    // res.json(this.queue);
    // ws.send(JSON.stringify(respObj));
  }

  // handlePortOpen(req, res) {
  //   const respObj = {
  //     // if port status is "true", it is open.
  //     portStatus: true,
  //   };
  //   res.json(respObj);
  // }

  handlePortIsOpen(host, parsedMessage) {
    const message = {
      eventType: 'joinMatch',
      address: host._socket.remoteAddress,
      port: parsedMessage.port,
    };
    host.isMatchedWith.send(JSON.stringify(message));
  }

  handleDumpQueue(req, res) {
    // if (req.headers.devclientid === auth.devClientID) {
    return res.json(this.queue);
    // } else {
    // res.status(403);
    // res.json('Error: Forbidden');
    // }
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

  evaluateOpponentPingResult(parsedMessage, host) {
    const opponent = this.queue[host.regionCode][parsedMessage.matchers[0].matcherID];
    if (parsedMessage.matchers[0].ping <= this.maxPing && !host.isMatchedWith && !opponent.isMatchedWith) {
      host.isMatchedWith = opponent;
      opponent.isMatchedWith = host;
      this.sendOpenPort(host);
    } else {
      this.selectPlayerToTest(host);
    }
  }

  sendOpenPort(host) {
    console.log('SEND OPEN PORT', host.matcherID);
    const message = {
      eventType: 'openPort',
    };
    host.send(JSON.stringify(message));
  }

  selectPlayerToTest(host) {
    console.log('SELECT PLAYER TO TEST', host.matcherID);
    const matcherIDs = Object.keys(this.queue[host.regionCode]);
    let opponent = undefined;
    let i = 0;
    while (!opponent && i < matcherIDs.length) {
      const matcher = this.queue[host.regionCode][matcherIDs[i]];
      console.log('SELECT PLAYER TO TEST FOR', host.matcherID, matcher.matcherID);
      if (!host.badMatchers.includes(matcherIDs[i]) && !matcher.isMatchedWith) {
        console.log('SELECT PLAYER TO TEST - FOUND');
        opponent = matcher;
      }
    }
    if (!opponent) {
      console.log('NO OPPONENT FOR', host.matcherID);
      const message = {
        eventType: 'noOpponents',
      };
      host.send(JSON.stringify(message));
      setTimeout(() => this.selectPlayerToTest(host), 10000);
    }
    if (!host.isMatchedWith) {
      const message = {
        eventType: 'pingTest',
        matchers: [
          {
            matcherID: opponent.matcherID,
            address: opponent._socket.remoteAddress,
          },
        ],
      };
      console.log('SELECT PLAYER TO TEST - SENDING TO', host.matcherID);
      host.send(JSON.stringify(message));
    }
  }
}

module.exports = Matchmaker;
