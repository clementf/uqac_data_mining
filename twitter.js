var Twitter = require('twitter');
var fs = require('fs');
var tweets = [];

var client = new Twitter({
	consumer_key: 'GlxjhWYZpMeLqt68A89oiGRg8',
	consumer_secret: 'vo2ogtLYwS7OlzGLY6AdTu39slKxdmTgiWlcEQ0NAyapX0At7Y',
	access_token_key: '576267171-5pcWsZ0Zuigj7KK6cKIemfS4paq4pjHqwEVYIFo9',
	access_token_secret: 'tpzaYsyrkO8crGeLAGCHbe2QFoe0P0PxG5HwLp3TMJFR5'
});

exports.client = client;

exports.process = function(searchTerm, perso, processData, writeFile) {
	fs.stat('./data/' + searchTerm + '.json', function(err, stat) {
		if (err == null) {
			fs.readFile('./data/' + searchTerm + '.json', function(err, tweets) {
				if (err) {
					console.log('cannot read file for TT : ' + searchTerm);
					process.exit(1);
				} else {
					processData(JSON.parse(tweets));
					writeFile(searchTerm, JSON.parse(tweets));
				}
			});

		} else if (err.code == 'ENOENT') {
			var params = {				
				'count': 100,				
			};
			if(!perso){
				params.q = searchTerm;
				//params.lang = 'fr';
				getTweets(params, processData, writeFile);
			}
			else
				getUserTweets(searchTerm, params, processData, writeFile);

		} else {
			console.log('Some other error: ', err.code);
			process.exit(1);
		}
	});
}

var getTweets = function(params, processData, writeFile) {
	client.get('search/tweets', params, function(error, tw, response) {
		if (!error) {			
			tweets = tweets.concat(tw.statuses);
			console.log(tweets.length);
			if (tweets.length < 10000) {
				params.max_id = tw.search_metadata.max_id;
				setTimeout(function() {
					getTweets(params, processData, writeFile);
				}, 3000)
			} else {
				writeJson(params.q, tweets, function() {
					processData(tweets);
					writeFile(params.q, tweets);
				});
			}
		} else {
			console.log(error);
			if(tweets.length > 100){
				writeJson(params.q, tweets, function() {
					processData(tweets);
					writeFile(params.q, tweets);
				});
			}
			process.exit(1);
		}
	});

}

var getUserTweets = function(user, params, processData, writeFile) {	
	params.screen_name = user;
	client.get('statuses/user_timeline', params, function(error, tw, response) {
		if (!error) {						
			tweets = tweets.concat(tw);
			console.log(tweets.length);
			if (tweets.length < 3000) {
				params.max_id = tw[tw.length - 1].id;				
				setTimeout(function() {
					getUserTweets(user, params, processData, writeFile);
				}, 2000)
			} else {
				writeJson(user, tweets, function() {
					processData(tweets);
					writeFile(user, tweets);
				});
			}
		} else {
			console.log(error);
			if(tweets.length > 100){
				writeJson(params.q, tweets, function() {
					processData(tweets);
					writeFile(params.q, tweets);
				});
			}
			process.exit(1);
		}
	});

}


function writeJson(tt, data, callback) {
	fs.writeFile('./data/' + tt + '.json', JSON.stringify(data), function(err) {
		if (err) {
			console.log('Error when writing json');
			return console.log(err);
		}
		console.log("The json file for top trend " + tt + " was saved!");
		callback();
	});
}