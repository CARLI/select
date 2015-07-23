var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport(null);

transporter.sendMail({
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


