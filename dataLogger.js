var request = require('request');
var endpoint = 'http://128.199.239.166';

var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/json'
}

var options = {
    url: endpoint,
    method: 'POST',
    headers: headers
}

exports.save = function(deviceId, data, success, error){
    var options = {
        url: endpoint + '/history',
        method: 'POST',
        headers: headers,
        form: {
            userId : '',
            deviceId : deviceId,
            data : data
        }
    };

    request(options, function (err, response, body) {
        if (!error && response.statusCode == 200) {
            success(body);
        } else {
            error(err);
        }
    });
};