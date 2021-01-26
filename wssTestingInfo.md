## Tools

Tool: Simple WebSocket Client extension for firefox:

https://addons.mozilla.org/en-US/firefox/addon/simple-websocket-client/

Put this link into the "URL" box and hit "Open":

ws://fierce-lowlands-57630.herokuapp.com/

WSS messages that contain JSON objects must stringify the obejct first.

Here is a JSON stringifier utility:

https://tools.knowledgewalls.com/jsontostring

---

## Process

Open multiple tabs of your WS testing tool.

Connect each one to the server via a WS connection.

Use Postman to see the contents of the queue with the /dump-queues/ route.

---

## Join Queue/Connection start

No body/message is needed for this. Just start the connection and the geolocation matcher data comes back.

## Ping Test Result

Stringified JSON message for geolocation ping test result:

```
"{\"eventType\":\"pingTestResponse\",\"matchers\":[{\"matcherID\":\"NorthAmericaWest\",\"pingResult\":100},{\"matcherID\":\"NorthAmericaEast\",\"pingResult\":120},{\"matcherID\":\"Australia\",\"pingResult\":130}]}"
```

To use the above, cahnge whichever region you want to be sorted into to the lowest ping number.

Stringified JSON message for normal ping test result:

```
"{\"eventType\":\"pingTestResponse\",\"matchers\":[{\"matcherID\":\"MatcherID\",\"ping\":100}]}"
```

To use this, connect at least 2 WS connections, run the /dump-queues/ route in Postman, then paste a matcherID that is not assigned to the WS connection you're using into the matcherID.

If pingResult is below 126, the connection process will start. If above 126, a new matcher should be sent back.

```
"{\"eventType\":\"portIsOpen\",\"port\":12345}"
```
