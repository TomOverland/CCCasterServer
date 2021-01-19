class Matchmaker {
  init() {}

  handleJoinQueue(req, res) {
    const respObj = {
      clientMatcherID: '12345',
    };
    res.json(respObj);
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
}

module.exports = Matchmaker;
