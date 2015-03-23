var chai   = require( 'chai' )
    , expect = chai.expect
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    ;

testUtils.setupTestDb();

function validNotificationTemplateData() {
    return {
        type: 'NotificationTemplate',
        name: 'Test template',
        subject: 'Test subject',
        notificationType: 'other'
    };
}

function invalidNotificationTemplateData() {
    return {
        type: 'NotificationTemplate'
    };
}

test.run('NotificationTemplate', validNotificationTemplateData, invalidNotificationTemplateData);
