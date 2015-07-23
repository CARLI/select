var mailer = require('nodemailer');
var request = require('request');
var mailTransport = mailer.createTransport(null);

function tellPixobot(envelope) {
    if (typeof envelope === 'string') {
        envelope = { message: envelope };
    }
    request({
        url: 'http://pixobot.herokuapp.com/hubot/message-room/37097_carli@conf.hipchat.com',
        method: 'post',
        json: envelope
    });
}

function sendMail() {
    mailTransport.sendMail({
        from: 'yoda@pixotech.com',
        to: 'carli@pixotech.com',
        subject: 'May the force be with you',
        text: 'Easy, sending email from node is.',
        html: '<img src="cid:yoda.jpg">' +
        '<p>Easy, sending email from node is.</p>',
        attachments: [
            {
                cid: 'yoda.jpg',
                path: './yoda.jpg'
            }
        ]
    });
}

module.exports = {
    tellPixobot: tellPixobot
};
