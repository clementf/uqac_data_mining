var fs = require('fs');

var dataSource = require("./original_data.js");
var twitter = require('./twitter.js');

var DEBUG = true;
var words = {};
var searchTerm = 'roadtrip';
var medianEng = 0;

twitter.process(searchTerm, processData, writeFile);



function processData(data) {
	var engagements = [];
	for (var i in data) {				
		//An engagement measure like (2 * retweets + favorites + mentions) / followers		
		engagements.push((2 * data[i].retweet_count + data[i].favorite_count + data[i].entities.user_mentions.length) / data[i].user.followers_count);		

	}	
	medianEng = median(engagements)	
}

function writeFile(tt, data) {
	header = '@RELATION popular '+searchTerm+'\n';
	
	header += '\n @ATTRIBUTE popular {0,1}';
	header += '\n @ATTRIBUTE photo {0,1}';
	header += '\n @ATTRIBUTE link {0,1}';
	header += '\n @ATTRIBUTE 0_hashtag {0,1}';
	header += '\n @ATTRIBUTE  1_ou_2_hashtag {0,1}';
	header += '\n @ATTRIBUTE  3_et_plus_hashtag {0,1}';
	
	header += '\n\n\n'

	 body = '@data \n';

	for (var i in data) {		
		//Popular
		if((2 * data[i].retweet_count + data[i].favorite_count + data[i].entities.user_mentions.length) / data[i].user.followers_count > medianEng)
			body += '1,';
		else
			body += '0,';

		//Photo
		if(data[i].entities.media && data[i].entities.media.length > 0)
			body += '1,';
		else
			body += '0,';
		
		//link
		if(data[i].entities.urls && data[i].entities.urls.length > 0)
			body += '1,';
		else
			body += '0,';
		

		//Hashtag1
		if(data[i].entities.hashtags && data[i].entities.hashtags.length == 0)
			body += '1,';
		else
			body += '0,';
		
		//Hashtag2
		if(data[i].entities.hashtags && (data[i].entities.hashtags.length == 1 || data[i].entities.hashtags.length == 2 ))
			body += '1,';
		else
			body += '0,';
		
		//Hashtag3
		if(data[i].entities.hashtags && data[i].entities.hashtags.length > 2)
			body += '1,';
		else
			body += '0,';
		
		body = body.slice(0, -1);
		body += '\n';
	}

	fs.writeFile('./data/popular/'+tt + '.arff', header + body, function(err) {
		if (err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});
}


function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}