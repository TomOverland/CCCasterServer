# High level process overview

The server will store client sessions in queue with a Matcher object. This object will store a unique identifier, the client's IP, and a list of other clients' identifiers if they fail a ping test against the client. The server will pass an array of potential opponents' IP addresses and IDs to the client. The client runs a ping test on each IP and sends a response with the average ping to each IP and the ID for that IP. If pings were all too high, the server stores IDs whose ping were too high in the client's matcher object. If there was an acceptable ping, the server responds that a match is ready and that the client that did the ping test should open a port.

The shouldStartMatch KVP in a response object indicates that there is a host with a session open and waiting for the guest to join.

# How User Enters Queue

1. User starts CCCasterd
2. User selects "Matchmaking"
3. CLIENT will POST to the SERVER with CLIENT's IP Address using ROUTE /joinMatchmakingQueue/
4. SERVER receives CLIENT's IP
5. SERVER MATCHMAKER service creates a MATCHER object with a unique matcherID and stores it in a queue
6. SERVER responds to CLIENT with the client's matcherID

# How User Gets a Match

## Matchmaking in 3 steps:

- Client gets matcher addresses to evaluate and run ping tests on each
- Post ping test results
- Open port and send the open port# to the server

---

## Get matcher address

- CLIENT will POST to SERVER with MATCHER ID using ROUTE /get-matcher-address/

  _IF MATCHER with corresponding ID has no waiting match:_

- SERVER will select a number of MATCHERs (randomly)
- SERVER responds with a response with an array of objects containing a MATCHER ID and IP Address

  _IF MATCHER with corresponding ID has a waiting match:_

- SERVER responds with a code to start a match and the host's IP address and port
- SERVER removes both MATCHERs from queue

## Post ping test results

- CLIENT will ping test each IP address
- CLIENT uses /ping-result/ route to POST an array of objects containing MATCHER IDs and ping test results

  _IF MATCHER with corresponding ID has a waiting match:_

  - SERVER responds with a code to start a match and the host's IP address and port
  - SERVER removes both MATCHERs from queue

  _IF MATCHER with corresponding ID has no waiting match:_

  - SERVER evaluates ping results
  - IF bad results only, SERVER stores the bad MATCHER IDs in the MATCHER.badMatchIds arr and responds with a code to call /get-matcher-address/

  _IF Good result..._

  - SERVER responds with a code to open a port the selected MATCHER ID for netplay

## Open port

- CLIENT opens a port and posts the open port, local IP address, local, MATCHER ID, and matched opponent's MATCHER ID via /port-open/ to the SERVER
- SERVER marks the two MATCHERs as selected opponents, host and guest, and adds the hosts IP address and port to the guest's MATCHER object
- Upon guest MATCHER recieving the order to join the host, both MATCHER objects are removed from queue

---

# Routes:

## **/join-matchmaking-queue/**

### For a client to request a MATCHER ID and be added to matchmaking queue.

### Responses contain the client's matcherID or the client's matcherID and an array of MATCHERs to ping test against.

### If matchers arr is empty, wait some number of seconds before trying /get-matcher-address/.

**Method:** POST

### Request body contains:

```
{
    ipAddress: string
}
```

### Response options:

```
{
    status: 200,
    body: {
        clientMatcherID: string,
        matchers: [
            {
            matcherID: string,
            address: string
            }
        ]
    }
}
```

---

## **/get-matcher-address/**

### For a client to request an IP address to ping test against.

### Responses can be an array of potential users to ping test or an IP address and port to start a match with.

### If response is 204, wait some number of seconds and try /get-matcher-address/ again.

### If response's shouldStartMatch is false, matchAddress and matchPort will not be present.

### If response's shouldStartMatch is true, matchers arr will not be present.

**Method:**

### Request body contains:

```
{
    clientMatcherId
}
```

### Response options:

```
{
    status: 204
}
```

```
{
    status: 200,
    shouldStartMatch: bool,
    matchAddress: string,
    matchPort: string,
    matchers: [
        {
            matcherID: string,
            address: string
        }
    ]
}
```

---

## **/ping-result/**

### For a client to send the results of ping tests to different MATCHERs to the SERVER.

### If response's shouldStartMatch is false, matchAddress and matchPort will not be present.

### If response's shouldStartMatch is true, matchers arr will not be present.

**Method:** POST

### Request body contains:

```
{
    clientMatcherId: string,
    matchers: [
        {
        pingResult: string,
        matcherID: string
        }
    ]
}
```

### Response options

```
{
    status: 204
}
```

```
{
    status: 200,
    shouldStartMatch: bool,
    matcherAddress: string,
    matchers: [
        {
        address: string,
        matcherID: string
        }
    ]
}
```

---

## **/port-open/**

For a client to send the port that the client currently has open and the ID of the intended opponent to the server.
Only triggered if the server has instructed the client that a match has been made and that they should host a session.
**Method: POST**

### Request body contains:

```
{
    port: string,
    ipAddress: string,
    clientMatcherID: string
}
```

### Response options:

```
{
    status: 200
}
```

---

# Classes/Services

### MATCHER Object:

```
ID: {
    matcherId: string,
    address: string,
    port: string,
    badMatchIds: arr of strings,
    timeCreated: Date,
    deleteSelf: callback function(matcherId),
    isMatchedWith: String (other matcher ID)
}
```

How to handle users that sit in queue and don't check in:

- After some time, user object will fire off a callback to the MATCHMAKER with it's own ID to delete itself

Check on server needs to happen every time an API request comes in to see if client already has been selected for a match by another client.

Notes/Changes to existing CCCaster:

1. Netplay should change to "manual netplay" or "manual match" or "host/join" or some such
2. Other option: Netplay should go to a sub-menu with matchmaking and host/join as sub-options
