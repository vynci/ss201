var mqtt = require('mqtt');
var port = Number(process.env.PORT || 4444);
var dataLogger = require('./dataLogger.js');

var sensorClient = mqtt.connect({
  host : '188.166.184.34',
  port : 6969,
  username : 'pipeeroac05c207b',
  password : '5738921e589fcb114312db62'
});

var tfssClient = mqtt.connect({
  host : 'ip-of-tfss-mqtt-broker',
  port : 1883,
  username : 'user',
  password : 'password'
});

tfssClient.on('connect', function () {
  console.log('tf-sensor-service connection established');
});

sensorClient.on('connect', function () {
  console.log('new thing connection');
});

sensorClient.subscribe('v1/messages/#');
tfssClient.subscribe('v1/actions/#');

// listen to messages coming from the sensor mqtt broker
sensorClient.on('message', function (topic, payload, packet) {
  console.log(topic + ' : ' + payload);
  var info = String(topic);
  info = info.split('/');

  var message = {
    version : info[0],
    type : info[1],
    deviceId : info[2]
  };

  if(message.type === 'messages'){
    // 1. authenticate message ( TODO )

    // 2. save the data log to nosql db
    dataLogger.save(message.deviceId, String(payload), function(result){
      console.log(result);
    }, function(error){
      console.log(error);
    });
    // 3. pass this message to tf webserver`
    console.log('transmitting to TF WebServer: ', payload);
    // tfssClient.publish(topic, payload);
  }

});

