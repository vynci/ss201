var mqtt = require('mqtt');
var server = require('http').createServer();
var io = require('socket.io')(server);
var port = Number(process.env.PORT || 4444);
// var dataLogger = require('./dataLogger.js');

var client = mqtt.connect({
  host : '188.166.184.34',
  port : 6969,
  username : 'pipeeroac05c207b',
  password : '5738921e589fcb114312db62'
});

io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    console.log('Subscribing to ' + data.topic);
    socket.join(data.topic);
    client.subscribe(data.topic);
  });

  socket.on('publish', function (data) {
    console.log('Publishing to ' + data.topic + " message: " + data.payload);
    client.publish(data.topic,data.payload);
  });
});

// listen to messages coming from the mqtt broker
client.on('message', function (topic, payload, packet) {
  console.log(topic+'='+payload);

//   var info = String(topic);
//   info = info.split('/');

//   dataLogger.addLog(info[2], info[1], String(payload));
  io.sockets.in(String(topic)).emit('server-to-client', {'topic':String(topic),'payload':String(payload)});
});

client.on('connect', function () {
  console.log('new thing connection');
  client.subscribe('vince-test');
});

server.listen(port);