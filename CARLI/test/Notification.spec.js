var chai   = require( 'chai' )
    , expect = chai.expect
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    ;

testUtils.setupTestDb();

function validNotificationData() {
    return {
        type: 'Notification',
        subject: 'Test subject',
        emailBody: 'To whom it may concern: Hi there. Yours sincerely, CARLI',
        recipients: 'carli@pixotech.com',
        draftStatus: 'draft'
    };
}

function invalidNotificationData() {
    return {
        type: 'Notification'
    };
}

test.run('Notification', validNotificationData, invalidNotificationData);
