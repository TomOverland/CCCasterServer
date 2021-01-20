const Matchmaker = require('./matchmaker');

describe('Matchmaker test suite', () => {
  it('should set a Matcher into the queue, and return a response with the Matchers Id', () => {
    const matchmaker = new Matchmaker();
    const mockReq = {
      ip: '1.2.3.4',
    };
    const json = jest.fn();
    const mockRes = {
      json: json,
    };
    matchmaker.handleJoinQueue(mockReq, mockRes);

    expect(json).toHaveBeenCalled();
  });
});
