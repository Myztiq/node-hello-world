var Primus = require('primus');
var path = require('path');
var http = require('http');
var fs = require('fs');
var crypto = require("crypto");


if (!process.env.PORT) {
  throw new Error('process.env.PORT is required!');
}
var server = http.createServer(function (req, res) {
  var filePath = path.join(__dirname, 'index.html');
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': stat.size
  });

  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}).listen(process.env.PORT);

var primus = new Primus(server, { transformer: 'engine.io' });

primus.use('substream', require('substream'));

primus.on('connection', function (spark) {
  for (var i=0; i<50; i++){
    var substream = spark.substream(i);
    sendData(substream, i);
  }
});

var streamCounter = {};
for (var i=0; i<50; i++) {
  streamCounter[i] = 0;
}
function sendData(stream, streamId) {
  setTimeout(function () {
    streamCounter[streamId]++;
    var message = {
      count: streamCounter[streamId],
      contents: '',
      length: Math.floor(Math.random() * 10000)
    };
    message.contents = crypto.randomBytes(message.length).toString('hex');
    stream.write(message);
    if(streamCounter[streamId] < 10000){
      sendData(stream, streamId);
    } else {
      console.log('Finished!');
    }
  }, Math.random() * 1000)
}

console.log('Server running at http://127.0.0.1:'+process.env.PORT+'/');
