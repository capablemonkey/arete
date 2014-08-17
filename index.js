var _ = require('underscore');
var execTime = require('exec-time');
var util = require('util');
var mockery = require('mockery');
var http = require('http');
var https = require('https');
var clone = require('clone');

// Use mockery to force the agent option of http.request
// and https.request by mocking http and https and overriding request

mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false
});

var httpsAgent = new https.Agent();
var httpAgent = new http.Agent();

httpsAgent.maxSockets = 10;
httpAgent.maxSockets = 10;

var httpMock = clone(http);
httpMock.request = function (options, cb) {
	options.agent = httpAgent;
	return http.request(options, cb);
}

var httpsMock = clone(https); 
httpsMock.request = function(options, cb) {
	options.agent = httpsAgent;
	return https.request(options, cb);
}

mockery.registerMock('http', httpMock);
mockery.registerMock('https', httpsMock);

// executes requests, calculate stat report, print to console
function loadTest(config) {
	if (!config) throw new Error("Missing argument config");

	// set default values, if properties not already set
	_.defaults(config, {
		printResponses: true,
		printReport: true,
		printSteps: true,
		name: 'default',
		concurrentRequests: 10
	})

	httpAgent.maxSockets = config.concurrentRequests;
	httpsAgent.maxSockets = config.concurrentRequests;

	executeRequests(config.name, config.requests, config.printResponses, config.printSteps, config.targetFunction, function(results) {
		var report = calculateStats(results);
 		
 		if (config.printReport) outputReport(report);

 		config.callback(null, report);
	});
}

function executeRequests(testName, numIterations, printResponses, printSteps, targetFn, callback) {
	var results = [];

	// start timer
	var profiler = new execTime(testName, printSteps, 'ms');
	profiler.beginProfiling();
	profiler.step('Starting to make requests');

	_.range(numIterations).forEach(function(id) {
		profiler.step('Sending request #' + id);

		targetFn(function(err, data) {
			var timeSinceLastResponse = profiler.elapsedSinceLastStep();
	   	profiler.step('Received response for request #' + id);

	   	// log result:
   		results.push({
   			requestId: id, 
   			success: err ? false : true,
   			response: err || data, 
   			timeSinceBeginning: profiler.elapsedSinceBeginning(),
   			timeSinceLastResponse: timeSinceLastResponse
   		});

   		if (printResponses) console.log(err || data);

	   	if (results.length == numIterations) {
	   		callback(results);
	   	}
		});
	});

	profiler.step('All requests fired off');
}

// calculate some statistics based on results.  all times in ms.
function calculateStats(results) {
	var report = {
		results: results,
		longestResponseTimeInterval: _.max(results, function(result){ return result.timeSinceLastResponse;}).timeSinceLastResponse,
		shortestResponseTimeInterval: _.min(results, function(result){ return result.timeSinceLastResponse;}).timeSinceLastResponse,
		averageResponseTimeInterval: _.reduce(results, function(prev, curr){ return prev + curr.timeSinceLastResponse; }, 0) / results.length,
		successfulResponses: _.where(results, {success: true}),
		shortestResponseTime: _.min(results, function(result){ return result.timeSinceBeginning;}).timeSinceBeginning,
		longestResponseTime:  _.max(results, function(result){ return result.timeSinceBeginning;}).timeSinceBeginning,
		averageResponseTime: _.reduce(results, function(prev, curr){ return prev + curr.timeSinceBeginning; }, 0) / results.length,
		timeElapsed: _.max(results, function(result){ return result.timeSinceBeginning;}).timeSinceBeginning
	};

	return report;
}

// Print out stat report
function outputReport(report) {
	// console.log("Response log:", results);
	console.log(" === LOOK MA', STATS! ===");
	console.log(util.format('%s requests fired, of which we got back %s successful responses (%s% success rate)', 
		report.results.length,
		report.successfulResponses.length,
		(report.successfulResponses.length / report.results.length * 100).toFixed(2)
	));
	console.log(' ');
	console.log('Longest time between responses: ', report.longestResponseTimeInterval, 'ms');
	console.log('Shortest time between responses: ', report.shortestResponseTimeInterval, 'ms');
	console.log('Average response time interval: ', report.averageResponseTimeInterval , 'ms');
	console.log(' ');
	console.log('Shortest response time: ', report.shortestResponseTime, 'ms');
	console.log('Longest response time: ', report.longestResponseTime, 'ms');
	console.log('Average response time: ', report.averageResponseTime , 'ms');
	console.log(' ')
	console.log('Total test duration: ', report.timeElapsed, 'ms');
}

module.exports = {
	loadTest: loadTest
};