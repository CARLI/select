var chai   = require( 'chai' )
    , expect = chai.expect
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    ;

testUtils.setupTestDb();

function validNotificationTemplateData() {
    return {
        name: 'Test template',
        subject: 'Test subject',
        type: 'NotificationTemplate'
    };
}

function invalidNotificationTemplateData() {
    return {
        type: 'NotificationTemplate'
    };
}

test.run('NotificationTemplate', validNotificationTemplateData, invalidNotificationTemplateData);
