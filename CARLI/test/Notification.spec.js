var chai   = require( 'chai' )
    , expect = chai.expect
    , notificationRepository = require('../Entity/NotificationRepository' )
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    , Q = require('q')
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

describe('the listDraft method', function(){
    it('should be a function', function(){
       expect(notificationRepository.listDrafts).to.be.a('function');
    });

    it('should return a promise that resolves to an array', function(){
        return notificationRepository.listDrafts()
            .then(function(drafts){
                return expect(drafts).to.be.an('array');
            });
    });

    it('should return only notifications with draft status', function (){
        var draft1 = validNotificationData();
        var draft2 = validNotificationData();
        var draft3 = validNotificationData();
        var sent1 = validNotificationData();

        sent1.draftStatus = 'sent';

        return testUtils.deleteDocumentsOfType('Notification')
            .then(function(){
                return Q.all([
                    notificationRepository.create(draft1),
                    notificationRepository.create(draft2),
                    notificationRepository.create(draft3),
                    notificationRepository.create(sent1)
                ]);
            })
            .then(notificationRepository.listDrafts)
            .then(function(list){
                return expect(list.length).to.equal(3);
            });
    });
});


describe('the listSent method', function(){
    it('should be a function', function(){
        expect(notificationRepository.listSent).to.be.a('function');
    });

    it('should return a promise that resolves to an array', function(){
        return notificationRepository.listSent()
            .then(function(sent){
                return expect(sent).to.be.an('array');
            });
    });

    it('should return only notifications with sent status', function (){
        var draft1 = validNotificationData();
        var sent1 = validNotificationData();
        var sent2 = validNotificationData();
        var sent3 = validNotificationData();

        sent1.draftStatus = 'sent';
        sent2.draftStatus = 'sent';
        sent3.draftStatus = 'sent';

        return testUtils.deleteDocumentsOfType('Notification')
            .then(function(){
                return Q.all([
                    notificationRepository.create(draft1),
                    notificationRepository.create(sent1),
                    notificationRepository.create(sent2),
                    notificationRepository.create(sent3)
                ]);
            })
            .then(notificationRepository.listSent)
            .then(function(list){
                return expect(list.length).to.equal(3);
            });
    });
});