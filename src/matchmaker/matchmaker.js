class Matchmaker {
  init() {}

  handleJoinQueue(req, res) {
    req.body.serverContact = true;
    res.json(req.body);
  }
}

module.exports = Matchmaker;
