var fs = require('fs');
var twitter = require('./twitter.js');

var DEBUG = false;
var words = {};
var searchTerm = '#NightShift';


twitter.process(searchTerm, false, processData, writeFile);



function processData(data) {	
	for (var i in data) {
		if (DEBUG) {
			console.log(data[i].text);
			console.log('\n-----------------------------------\n');
		}		
		
		var sentence = data[i].entities.hashtags;
		for (var j = 0; j < sentence.length; j++) {			
			//filter length and protocol
			//console.log(sentence[j]);
			if (sentence[j].text.toLowerCase().length > 3) {
				if (words[sentence[j].text.toLowerCase()] === undefined)
					words[sentence[j].text.toLowerCase()] = 1;
				else {
					words[sentence[j].text.toLowerCase()]++;
				}
			}
		}
		if (DEBUG) {
			console.log(data[i].user.followers_count);
			console.log(data[i].user.friends_count);
		}
	}
}

function writeFile(tt, data) {
	header = '@RELATION ' + searchTerm + '\n';
	console.log('Length before filtering : ' + Object.keys(words).length)
	for (var i in words) {		
		if (words[i] < 20) {			
			delete words[i];
		}
		else{
			header += '\n@ATTRIBUTE ' + i + ' {0,1} %length :' + words[i];
		}
	}
	console.log('Length after filtering : ' + Object.keys(words).length)
	

	header += '\n\n\n'

	body = '@data \n';

	for (var i in data) {
		for (var w in words) {
			if (data[i].text.toLowerCase().search(w) > -1) {
				body += '1,';
			} else {
				body += '0,';
			}
		}
		body = body.slice(0, -1);
		body += '\n';
	}

	fs.writeFile('./data/hashtag/' + tt + '.arff', header + body, function(err) {
		if (err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	});
}