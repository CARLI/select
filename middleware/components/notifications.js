var request = require('request');

function tellPixobot(envelope) {
    request({
        url: 'http://pixobot.herokuapp.com/hubot/message-room/37097_carli@conf.hipchat.com',
        method: 'post',
        json: envelope
    });
}

module.exports = {
    tellPixobot: tellPixobot
}
