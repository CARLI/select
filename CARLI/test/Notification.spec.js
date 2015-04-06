var chai   = require( 'chai' )
    , expect = chai.expect
    , notificationRepository = require('../Entity/NotificationRepository' )
    , offeringRepository = require('../Entity/OfferingRepository' )
    , cycleRepository = require('../Entity/CycleRepository' )
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    , Q = require('q')
    , uuid   = require( 'node-uuid' )
    ;

testUtils.setupTestDb();

function validNotificationData() {
    return {
        type: 'Notification',
        subject: 'Test subject',
        emailBody: 'To whom it may concern: Hi there. Yours sincerely, CARLI',
        targetEntity: 'targetId',
        draftStatus: 'draft',
        notificationType: 'other'
    };
}

function invalidNotificationData() {
    return {
        type: 'Notification'
    };
}

function testCycleData() {
    return {
        id: uuid.v4(),
        idalId: 200,
        name: testUtils.testDbMarker + ' Notification Tests ' + uuid.v4(),
        cycleType: 'Calendar Year',
        year: 2014,
        status: 5,
        isArchived: true,
        startDateForSelections: '2013-10-15',
        endDateForSelections: '2013-11-15',
        productsAvailableDate: '2014-01-01'
    };
}

function setupTestNotification( notification, offerings ){
    return cycleRepository.create(testCycleData())
        .then(cycleRepository.load)
        .then(function(cycle) {
            return createTestOfferings(cycle).thenResolve(cycle);
        })
        .then(function(cycle) {
            notification.cycle = cycle;
            notification.offerings = offerings;

            return notificationRepository.create(notification)
                .then(notificationRepository.load)
        });

    function createTestOfferings( cycle ){
        return Q.all( offerings.map(createOffering) );

        function createOffering( offering ){
            offering.cycle = cycle;
            return offeringRepository.create(offering, cycle);
        }
    }
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

describe('the getRecipientLabel method', function () {
    it('should be a function', function(){
        expect(notificationRepository.getRecipientLabel).to.be.a('function');
    });

    it('should return the correct label for a library invoice', function () {
        var recipientLabel = notificationRepository.getRecipientLabel('Test Library', 'invoice');
        expect(recipientLabel).to.equal('Test Library Invoice Contacts');
    });

    it('should return the correct label for a vendor report', function () {
        var recipientLabel = notificationRepository.getRecipientLabel('Test Vendor', 'report');
        expect(recipientLabel).to.equal('Test Vendor Report Contacts');
    });

    it('should return the correct label for a subscription related notification', function () {
        var recipientLabel = notificationRepository.getRecipientLabel('Test Library', 'subscription');
        expect(recipientLabel).to.equal('Test Library Subscription Contacts');
    });
});

describe('Persisting offerings on a Notification', function(){
    it('should load Offerings objects on a loaded Notification', function(){
        var offerings = [
            {id: uuid.v4(), type: 'Offering', library: '', product: ''}
        ];
        var notification = validNotificationData();

        return setupTestNotification(notification, offerings).then(function(notification){
            return Q.all([
                expect(notification.offerings).to.be.an('array'),
                expect(notification.offerings[0]).to.be.an('object'),
                expect(notification.offerings[0].type).to.equal('Offering')
            ]);
        });
    });
});

describe('Adding functions to Notification instances', function () {
    it('should add a getSummaryTotal method to instances of Notification', function () {
        var notification = validNotificationData();

        return notificationRepository.create(notification)
            .then(notificationRepository.load)
            .then(function (loadedNotification) {
                return expect(loadedNotification.getSummaryTotal).to.be.a('function');
            });
    });

    describe('notification.getSummaryTotal', function() {
        var offerings = [
            {
                id: uuid.v4(),
                type: 'Offering',
                library: '',
                product: '',
                selection: {
                    price: 100
                }
            },
            {
                id: uuid.v4(),
                type: 'Offering',
                library: '',
                product: '',
                selection: {
                    price: 100
                }
            }
        ];

        var notification = validNotificationData();

        it('should return a summary equal to the total of all selected prices in the given offerings', function() {
            return setupTestNotification(notification, offerings).then(function(notification){
                return expect(notification.getSummaryTotal()).to.equal(200);
            });
        });
    });

    it('should add a getRecipientLabel method to instances of Notification', function () {
        var notification = validNotificationData();

        return notificationRepository.create(notification)
            .then(notificationRepository.load)
            .then(function (loadedNotification) {
                return expect(loadedNotification.getRecipientLabel).to.be.a('function');
            });
    });
});

describe('the notificationTypeIsForLibrary method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeIsForLibrary).to.be.a('function');
    });

    it('should return the correct value for a library invoice', function () {
        expect(notificationRepository.notificationTypeIsForLibrary('invoice')).to.be.true;
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForLibrary('report')).to.be.false;
    });

    it('should return the correct value for a subscription related notification', function () {
        expect(notificationRepository.notificationTypeIsForLibrary('subscription')).to.be.true;
    });
});

describe('the notificationTypeIsForVendor method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeIsForVendor).to.be.a('function');
    });

    it('should return the correct value for a library invoice', function () {
        expect(notificationRepository.notificationTypeIsForVendor('invoice')).to.be.false;
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForVendor('report')).to.be.true;
    });

    it('should return the correct value for a subscription related notification', function () {
        expect(notificationRepository.notificationTypeIsForVendor('subscription')).to.be.false;
    });
});
