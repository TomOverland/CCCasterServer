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
  it('should find a match if an opponent is available', () => {
    const expectedResult = {
      matchAddress: '192.168.1.1:12345',
      matchPort: '1.2.3.4',
      shouldStartMatch: true,
    };

    const matchmaker = new Matchmaker();
    const mockOpponent = {
      matcherId: 'matcherId',
      address: 'address',
      port: '1.2.3.4',
      badMatchIds: [],
      timeCreated: '12:00',
      isMatchedWith: 'NW-123456',
    };

    const mockUser = {
      matcherId: 'matcherId',
      address: 'address',
      port: '1.2.3.4',
      badMatchIds: [],
      timeCreated: '12:00',
      isMatchedWith: 'NW-654321',
    };

    const json = jest.fn();
    const res = {
      json: json,
    };

    matchmaker.queue.NW['NW-123456'] = mockUser;
    matchmaker.queue.NW['NW-654321'] = mockOpponent;

    matchmaker.isMatchedWith('NW-123456', res);
    expect(json).toHaveBeenCalledWith(expectedResult);
  });
});
