var chai = require('chai');
var expect = chai.expect;
var test = require('./Entity/EntityInterface.spec');
var testUtils = require('./utils');
var notificationTemplateRepository = require('../Entity/NotificationTemplateRepository');
var uuid = require('node-uuid');

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

describe('NotificationTemplate additional methods', function(){
    it('should have an isCustomTemplate method', function(){
        expect(notificationTemplateRepository.isCustomTemplate).to.be.a('function');
    });

    it('should return false for templates whose type is not "other"', function(){
        return setupTestNotificationTemplate(uuid.v4(), 'invoice')
            .then(expectIsCustomTemplateFalse);
    });

    it('should return true for template with type "other"', function(){
        return setupTestNotificationTemplate(uuid.v4(), 'other')
            .then(expectIsCustomTemplateTrue);
    });

    it('should return false for template with type "other" that are not built in', function(){
        /* The 'notification-template-open-system' is the only built-in template that has
         * notificationType 'other'. It's a special case. If any other built-in templates with
         * type = 'other' are added, make sure to add special cases here.
         * (Where "built-in" means something in the system depends on its existence).
         */
        return setupTestNotificationTemplate('notification-template-open-system', 'other')
            .then(expectIsCustomTemplateFalse);
    });

    function setupTestNotificationTemplate(templateId, templateType){
        return notificationTemplateRepository.create({
            id: templateId,
            name: 'Test Template',
            subject: 'test subject',
            notificationType: templateType
        });
    }

    function expectIsCustomTemplateFalse( templateId ){
        return notificationTemplateRepository.load(templateId)
            .then(function(template){
                return expect(notificationTemplateRepository.isCustomTemplate(template)).to.equal(false);
            });
    }

    function expectIsCustomTemplateTrue( templateId ){
        return notificationTemplateRepository.load(templateId)
            .then(function(template){
                return expect(notificationTemplateRepository.isCustomTemplate(template)).to.equal(true);
            });
    }
});