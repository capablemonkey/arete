# arete

Load testing for APIs and websites.

Hijacks `http` and `https` to let you force however many concurrent connections you'd like.

Designed to let you easily use a library to make your requests, whether that's an API wrapper like `dwolla-node` or request helper like `requests`.

Easily write a batch of load tests and organize them with `mocha`.

## Example

Let's make 1000 GET requests to `https://news.ycombinator.com/`:

```
var arete = require('arete');
var request = require('request');

arete.loadTest({
  name: 'hn-1000',
  requests: 1000,
  concurrentRequests: 100,
  targetFunction: function(callback) {
    request('https://news.ycombinator.com/', function(error, response, body) {
      callback(error, body);
    })
  },
  callback: function() {}
});
```

When we run this, we'll start making those requests...

```
hn-1000 - Begin profiling
hn-1000 - Starting to make requests - 0.129 ms (total: 0.273 ms)
hn-1000 - Sending request #0 - 0.303 ms (total: 0.645 ms)
hn-1000 - Sending request #1 - 3.282 ms (total: 3.976 ms)
hn-1000 - Sending request #2 - 0.443 ms (total: 4.469 ms)
hn-1000 - Sending request #3 - 0.256 ms (total: 4.767 ms)
```

As the responses come in, we note the time since the last response and the total elapsed time so far

```
hn-1000 - All requests fired off - 0.099 ms (total: 15.177 ms)
hn-1000 - Received response for request #0 - 419.252 ms (total: 434.460 ms)
hn-1000 - Received response for request #27 - 5.720 ms (total: 440.317 ms)
hn-1000 - Received response for request #42 - 5.080 ms (total: 445.475 ms)
hn-1000 - Received response for request #25 - 8.148 ms (total: 453.684 ms)
hn-1000 - Received response for request #49 - 11.850 ms (total: 465.596 ms)
```

Notice that the responses won't necessarily come in the order which they were sent.

When all the responses have arrived, we spit out a report:

```
 === LOOK MA', STATS! ===
50 requests fired, of which we got back 50 successful responses (100.00% success rate)

Longest time between responses:  419.238441 ms
Shortest time between responses:  0.70436 ms
Average response time interval:  19.629927020000004 ms

Shortest response time:  434.612736 ms
Longest response time:  1003.092273 ms
Average response time:  679.37676786 ms

Total test duration:  1003.092273 ms
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
      callback: function(error, report) {       
        assert.equal(report.successfulResponses.length, report.results.length, "We didn't get all successful responses!");
        assert(report.averageResponseTimeInterval < 100, "Time between responses is way too long!");
        assert(report.timeElapsed < 20000, "Unacceptable amount of time for 1000 requests to complete: 20 seconds");
        done();
      }
    });

  });
});
```

Here, we make assertions the results of the test.  If it took over 20 seconds to serve 1000 requests, we'll throw an error!  This is useful for automated testing.

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
