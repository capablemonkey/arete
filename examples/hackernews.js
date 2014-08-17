var arete = require('../index.js');
var request = require('request');
var assert = require('assert');

// Try 1000 requests against google autocomplete, for comparison:

describe('Hacker News', function() {
	it('1000 GET requests', function(done) {

		arete.loadTest({
			name: 'hn-1000',
			requests: 1000,
			concurrentRequests: 50,
			targetFunction: function(callback) {
				request('https://news.ycombinator.com/', function(error, response, body) {
					callback(error, body);
				})
			},
			printResponses: false,
			printReport: true,
			printSteps: true,
			callback: function(error, report) {				
				assert.equal(report.successfulResponses.length, report.results.length, "We didn't get all successful responses!");
				assert(report.averageResponseTimeInterval < 100, "Time between responses is way too long!");
				assert(report.timeElapsed < 20000, "Unacceptable amount of time for 1000 requests to complete: 20 seconds");
				done();
			}
		});
	});
});