var arete = require('../index.js');
var request = require('request');


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
			callback: done
		});
	});
});