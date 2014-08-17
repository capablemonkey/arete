# arete

Load testing for APIs and websites.

Hijacks `http` and `https` to let you force however many concurrent connections you'd like.

Designed to let you easily use a library to make your requests, whether that's an API wrapper like `dwolla-node` or request helper like `requests`.

Easily write a batch of load tests and organize them with `mocha`.

## Example

```
var arete = require('arete');
var request = require('request');

arete.loadTest({
  name: 'hn-1000',
  requests: 50,
  concurrentRequests: 50,
  targetFunction: function(callback) {
    request('https://news.ycombinator.com/', function(error, response, body) {
      callback(error, body);
    })
  },
  printResponses: false,
  printReport: true,
  printSteps: true,
  callback: function() {}
});
```

Here's a mocha test suite which uses arete and the `google-autocomplete` module to query Google's search suggestion service 1000 times.

```
var arete = require('arete');
var autocomplete = require('google-autocomplete');

// Try 1000 requests against google autocomplete

describe('Google Autocomplete', function() {
  it('1000 queries to Google autocomplete', function(done) {

    arete.loadTest({
      name: 'google-1000',
      requests: 1000,
      concurrentRequests: 50,
      targetFunction: function(callback) {
        autocomplete.getQuerySuggestions('foo', callback);
      },
      printResponses: false,
      callback: done
    });

  });
});
```

You'll get something like...

```
  Google Autocomplete
google-1000 - Begin profiling
google-1000 - Starting to make requests - 0.135 ms (total: 0.274 ms)
google-1000 - Sending request #0 - 0.335 ms (total: 0.680 ms)
google-1000 - Sending request #1 - 3.242 ms (total: 3.974 ms)
google-1000 - Sending request #2 - 0.487 ms (total: 4.511 ms)

...


```

Try some examples yourself:

First, you'll need to run `npm install` from the `./examples/` directory to install some dependecies.  Then, you try:

`mocha examples/google.js`

and

`mocha examples/hackernews.js`

## Config Options

`requests: 1000` to set number of requests to 1000

`concurrentRequests: 50` number of concurrent requests.  Maximum will vary depending on your machine and available resources.  It too high, you'll get errors.

`targetFunction: function(callback) {}` is the function to be called repeatedly.  This function is passed a callback, and must call it with the request's `error` and/or `response`.

```javascript
var targetFunction = function(callback) {
  request('https://news.ycombinator.com/', function(error, response, body) {
    callback(error, body);
  })
}
```

`printReport: true` to print a stat report at the end of the run.

```
 === LOOK MA', STATS! ===
1000 requests fired, of which we got back 1000 successful responses (100.00% success rate)

Longest time between responses:  498.633764 ms
Shortest time between responses:  0.490936 ms
Average response time interval:  9.344444360999999 ms

Shortest response time:  721.940402 ms
Longest response time:  9690.901212 ms
Average response time:  5268.355600138996 ms
```

`printResponses: true` prints the API / web request's  response.

```
{
  foo: bar
}
```

`printSteps: true` log every request and response

```
hn-1000 - Sending request #998 - 0.215 ms (total: 222.165 ms)
hn-1000 - Sending request #999 - 0.207 ms (total: 222.426 ms)
hn-1000 - All requests fired off - 0.144 ms (total: 222.604 ms)
hn-1000 - Received response for request #2 - 498.646 ms (total: 721.291 ms)
hn-1000 - Received response for request #50 - 93.818 ms (total: 815.739 ms)
hn-1000 - Received response for request #27 - 177.449 ms (total: 993.296 ms)
hn-1000 - Received response for request #8 - 3.182 ms (total: 996.574 ms)
hn-1000 - Received response for request #19 - 53.527 ms (total: 1 s)
```
