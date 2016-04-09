var fs = require('fs');
var twitter = require('./twitter.js');

var words = {};
var searchTerm = '#NightShift';


twitter.process(searchTerm, false, processData, writeFile);

function processData(data) {
	for (var i in data) {
		//Get hashtags
		var sentence = data[i].entities.hashtags;
		for (var j = 0; j < sentence.length; j++) {
			//filter length and protocol			
			if (sentence[j].text.toLowerCase().length > 3) {
				//Create entry in object words or increment it
				if (words[sentence[j].text.toLowerCase()] === undefined)
					words[sentence[j].text.toLowerCase()] = 1;
				else {
					words[sentence[j].text.toLowerCase()]++;
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
	var header = '@RELATION ' + searchTerm + '\n';

	console.log('Length before filtering : ' + Object.keys(words).length)

	//Keep words when they occur more than 20 times
	for (var i in words) {
		if (words[i] < 20)
			delete words[i];
		else
			header += '\n@ATTRIBUTE ' + i + ' {0,1} %length :' + words[i];
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
	fs.writeFile('./data/hashtag/' + tt + '.arff', header + body, function(err) {
		if (err)
			return console.log(err);
		console.log("The file was saved!");
	});
}