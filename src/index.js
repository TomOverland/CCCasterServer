'use strict';
const express = require('express');
const Matchmaker = require('./matchmaker/matchmaker');
const RoutesController = require('./routes');
const log = require('./common/utils/logger');

const port = process.env.PORT || 3030;
const matchmaker = new Matchmaker();
const routeController = new RoutesController();
const router = routeController.init(matchmaker);

const app = express();
app.use((req, res, next) => router(req, res, next));
app.listen(port, () => log(`Listening on port ${port}`));
