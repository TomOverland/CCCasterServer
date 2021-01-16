### How User Enters Queue
1. User starts CCCaster
2. User selects "Matchmaking"
3. CLIENT will POST to the SERVER with CLIENT's IP Address using ROUTE /joinMatchmakingQueue/
4. SERVER receives CLIENT's IP
5. SERVER MATCHMAKER service creates a MATCHER object with a unique ID and stores it in a QUEUE object
6. SERVER responds to CLIENT with the ID

### How User Gets a Match
1. CLIENT will POST to SERVER with MATCHER ID using ROUTE /get-matcher-address/
2. SERVER will select a MATCHER at random

Ping result sent to server
Server recieves ping result and matcherID
Server evaluates ping result
(Happy path) Server responds to say "go ahead and start a match and wait to be contacted by this IP" (port post route)
Server also flags the matcher that was tested against with an IP:port to contact
Next time matcher uses /get-matcher-address/, response contains IP address and port to start match immediately

### Routes:
#### /join-matchmaking-queue/
For a client to request a MATCHER ID and be added to matchmaking queue.
POST
Body contains:
IP Address - String

Response options:
201: matcherID - String
400: invalid request, try again
500: server error

#### /get-matcher-address/${matcherID}
For a client to request an IP address to ping test against.
GET
Response options:
204: no other matchers, please retry in ## seconds
200: matcherAddress - String (attempt Ping test against this IP)
     matcherID - String (use this in /ping-result/ to identify user ping tested against)
400: invalid request, try again
500: server error

#### /ping-result/

#### /port-open/

### MATCHER Object:
ID - String
IP Address - String
Bad Match IDs - Arr of Strings
Time entered queue - Date object
deleteSelf: function that passes in ID to instruct MATCHMAKER to delete this MATCHER

ASSIGN USERS A TOKEN

MATCHMAKER class service will have a state object
- sub objects in this state will have keys of Tokens and values of Matcher Objects


How to handle users that sit in queue and don't check in:
- After some time, user object will fire off a callback to the MATCHMAKER with it's own ID to delete itself



Notes/Changes to existing CCCaster:
1. Netplay should change to "manual netplay" or "manual match" or "host/join" or some such
2. Other option: Netplay should go to a sub-menu with matchmaking and host/join as sub-options