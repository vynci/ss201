var mqtt = require('mqtt');
var port = Number(process.env.PORT || 4444);
var dataLogger = require('./dataLogger.js');

var sensorClient = mqtt.connect({
  host : '128.199.158.11',
  port : 8883,
  username : 'sensor-service',
  password : '12345'
});

var tfssClient = mqtt.connect({
  host : '188.166.184.34',
  port : 6969,
  username : 'pipeeroac05c207b',
  password : '5738921e589fcb114312db62'
});

tfssClient.on('connect', function () {
  console.log('tf-sensor-service connection established');
});

sensorClient.on('connect', function () {
  console.log('new thing connection');
});

sensorClient.subscribe('#');
tfssClient.subscribe('v1/actions/#');

// listen to messages coming from the sensor mqtt broker
sensorClient.on('message', function (topic, payload, packet) {
  console.log(packet);
  // console.log('received: ' + topic + ' : ' + payload);
  var info = String(topic);
  info = info.split('/');

  var message = {
    version : info[0],
    type : info[1],
    deviceId : info[2]
  };

  if(message.type === 'messages'){
    // 1. authenticate message ( TODO )
    if(authenticateMessage(message)){
      // 2. save the data log to nosql db
      dataLogger.save(message.deviceId, String(payload), function(result){
      }, function(error){
        console.log(error);
      });         

      // 3. pass this message to tf webserver`
      console.log('transmitting to TF WebServer: ', payload.toString());
      tfssClient.publish(topic, payload);      
    } else {
      // if message has invalid token, send back error message 
      var callbackTopic = 'v1/errors/<deviceId>';
      sensorClient.publish(callbackTopic, callbackPayload);
    }
  } else if(message.type === 'actions'){
    // process messages in 'action'type
  } else{
    console.log('invalid path');
    sensorClient.unsubscribe('#');
    if(topic === '1004'){
      sensorClient.publish('v1/errors/1004', '403:' + topic + ':invalid path');
    }else{
      sensorClient.publish('v1/errors/1003', '403:' + topic + ':invalid path');
    }
    
    sensorClient.subscribe('#');
  }

});

function authenticateMessage(message){
  // 1. look up in the database if session token exists
  // 2. if valid, decode the token and check the sender

  return true;
}

