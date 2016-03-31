var Twitter = require('twitter');
var fs = require('fs');

var client = new Twitter({
  consumer_key: 'GlxjhWYZpMeLqt68A89oiGRg8',
  consumer_secret: 'vo2ogtLYwS7OlzGLY6AdTu39slKxdmTgiWlcEQ0NAyapX0At7Y',
  access_token_key: '576267171-5pcWsZ0Zuigj7KK6cKIemfS4paq4pjHqwEVYIFo9',
  access_token_secret: 'tpzaYsyrkO8crGeLAGCHbe2QFoe0P0PxG5HwLp3TMJFR5'
});

exports.client = client;
  
exports.process = function(searchTerm, processData, writeFile){
	fs.stat('./data/'+searchTerm + '.json', function(err, stat) {
	if (err == null) {
		fs.readFile('./data/'+searchTerm + '.json', function(err, tweets) {
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
			'q': searchTerm,
			'count': 100,
			'lang': 'fr'
		};
		client.get('search/tweets', params, function(error, tweets, response) {
			if (!error) {				
				writeJson(searchTerm, tweets, function(){
					processData(tweets);
					writeFile(searchTerm, tweets);
				});								
				
			}
			else{
				process.exit(1);
			}
		});
	} else {
		console.log('Some other error: ', err.code);
		process.exit(1);
	}
});
}



function writeJson(tt, data, callback) {
	fs.writeFile('./data/'+tt + '.json', JSON.stringify(data), function(err) {
		if (err) {
			console.log('Error when writing json');
			return console.log(err);
		}		
		console.log("The json file for top trend " + tt + " was saved!");
		callback();
	});
}