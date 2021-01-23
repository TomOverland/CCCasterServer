const express = require('express');
const bodyParser = require('body-parser');

class RoutesController {
  constructor() {
    this.matchmaker;
  }

  init(matchmaker, wss) {
    this.matchmaker = matchmaker;
    this.router = new express.Router();
    this.wss = wss;
    this.proxyRoutes();
    console.log('router init complete', this.matchmaker);
    return this.router;
  }

  proxyRoutes() {
    this.router.post(
      '/get-matcher-address/',
      bodyParser.json({
        limit: '1024kb',
        type: 'application/json',
      }),
      this.matchmaker.handleGetMatchers
    );
    this.router.post(
      '/port-open/',
      bodyParser.json({
        limit: '1024kb',
        type: 'application/json',
      }),
      this.matchmaker.handlePortOpen
    );
    this.router.get('/dump-queues/', this.matchmaker.handleDumpQueue);

    this.wss.on('connection', (ws) => {
      this.matchmaker.handleJoinQueue(ws);
      ws.on('message', (message) => {
        const parsedMessage = JSON.parse(JSON.parse(message));
        console.log(parsedMessage);
        switch (parsedMessage.eventType) {
          case 'pingTestResponse':
            console.log('is ping test');
            this.matchmaker.handlePingResult(ws, parsedMessage);
            break;
          case 'sendOpenPort':
            const respObj = {
              eventType: 'openPort',
            };
            ws.send(JSON.stringify(respObj));
            break;
          // case ''
        }
      });
    });
  }
}

module.exports = RoutesController;
