var arete = require('../index.js');
var autocomplete = require('google-autocomplete');

// Try 1000 requests against google autocomplete, for comparison:

describe('Google Autocomplete', function() {
	it('1000 queries to Google autocomplete', function(done) {

		arete.loadTest({
			name: 'google-1000',
			requests: 1000,
			concurrentRequests: 50,
			targetFunction: function(callback) {
				autocomplete.getQuerySuggestions('foo', callback);
			},
			printResponses: true,
			printReport: true,
			callback: done
		});
	});
});