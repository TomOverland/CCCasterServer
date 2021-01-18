const express = require('express');
const bodyParser = require('body-parser');

class RoutesController {
  init(matchmaker) {
    this.matchmaker = matchmaker;
    this.router = new express.Router();
    this.proxyRoutes();
    console.log('router init complete', this.matchmaker);
    return this.router;
  }

  proxyRoutes() {
    this.router.post(
      '/join-matchmaking-queue/',
      bodyParser.json({
        limit: '1024kb',
        type: 'application/json',
      }),
      this.matchmaker.handleJoinQueue
    );
  }
}

module.exports = RoutesController;
