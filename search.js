var fs = require('fs');

var dataSource = require("./original_data.js");
var twitter = require('./twitter.js');

var DEBUG = false;
var words = {};
var searchTerm = 'voyages';


twitter.process(searchTerm, processData, writeFile);



function processData(data) {
	for (var i in data.statuses) {
		if (DEBUG) {
			console.log(data.statuses[i].text);
			console.log('\n-----------------------------------\n');
		}
		var sentence = data.statuses[i].text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/);
		for (var j = 0; j < sentence.length; j++) {
			//filter length and protocol
			if (sentence[j].length > 4 && sentence[j] !== 'https' && sentence[j] !== 'http') {
				if (words[sentence[j]] === undefined)
					words[sentence[j]] = 1;
				else {
					words[sentence[j]]++;
				}
			}
		}
		if (DEBUG) {
			console.log(data.statuses[i].user.followers_count);
			console.log(data.statuses[i].user.friends_count);
		}
	}
}

function writeFile(tt, data) {
	header = '@RELATION search '+searchTerm+'\n';
	for (var i in words) {
		header += '\n @ATTRIBUTE ' + i + ' {0,1}';
	}

	header += '\n\n\n'

	body = '@data \n';

	for (var i in data.statuses) {
		for (var w in words) {
			if (data.statuses[i].text.toLowerCase().search(w) > -1) {
				body += '1,';
			} else {
				body += '0,';
			}
		}
		body = body.slice(0, -1);
		body += '\n';
	}

	fs.writeFile('./data/'+tt + '.arff', header + body, function(err) {
		if (err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
}



/**
 * word count mapreduce
 */

// var wordcnt = dataSource.data.statuses[i].text.replace(/[^\w\s]/g, "").split(/\s+/).reduce(function(map, word) {
// 	map[word] = (map[word] || 0) + 1;
// 	return map;
// }, Object.create(null));