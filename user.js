var fs = require('fs');
var twitter = require('./twitter.js');
var words = {};
var user = 'waxzce'; //user handle on twitter


twitter.process(user, true, processData, writeFile);



function processData(data) {
	for (var i in data) {
		var sentence = data[i].text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
		for (var j = 0; j < sentence.length; j++) {
			//filter length and protocol
			if (sentence[j].length > 3 && sentence[j] !== 'https' && sentence[j] !== 'http') {
				if (words[sentence[j]] === undefined)
					words[sentence[j]] = 1;
				else {
					words[sentence[j]]++;
				}
			}
		}
	}
}

/**
 * [writeFile Write the arff file]
 * @param  {[type]} tt   [search term]
 * @param  {[type]} data [tweets]
 */
function writeFile(tt, data) {
	var header = '@RELATION ' + user + ' \n';
	
	console.log('Length before filtering : ' + Object.keys(words).length)
	
	for (var i in words) {
		if (words[i] < 20)
			delete words[i];
		else
			header += '\n @ATTRIBUTE ' + i + ' {0,1} %length :' + words[i];
	}

	console.log('Length after filtering : ' + Object.keys(words).length)

	header += '\n\n\n'

	var body = '@data \n';

	for (var i in data) {
		for (var w in words) {
			if (data[i].text.toLowerCase().search(w) > -1)
				body += '1,';
			else
				body += '0,';
		}
		body = body.slice(0, -1);
		body += '\n';
	}
	//Write file asyncronously
	fs.writeFile('./data/user/' + tt + '.arff', header + body, function(err) {
		if (err)
			return console.log(err);
		console.log("The file was saved!");
	});
}