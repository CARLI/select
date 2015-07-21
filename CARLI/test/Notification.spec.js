var chai   = require( 'chai' )
    , expect = chai.expect
    , notificationRepository = require('../Entity/NotificationRepository' )
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    , Q = require('q')
    , uuid   = require( 'node-uuid' )
    , vendorRepository = require('../Entity/VendorRepository' )
    ;

testUtils.setupTestDb();

function validNotificationData() {
    return {
        type: 'Notification',
        subject: 'Test subject',
        emailBody: 'To whom it may concern: Hi there. Yours sincerely, CARLI',
        targetEntity: 'targetId',
        draftStatus: 'draft',
        notificationType: 'other',
        isFeeInvoice: false
    };
}

function invalidNotificationData() {
    return {
        type: 'Notification'
    };
}

test.run('Notification', validNotificationData, invalidNotificationData);

describe('The NotificationRepository', function(){
    it('should expand the targetEntity property to a library', function(){
        var testLibrary = '1';
        var testNotification = validNotificationData();
        testNotification.targetEntity = testLibrary;
        testNotification.notificationType = 'invoice';

        return notificationRepository.create(testNotification)
            .then(notificationRepository.load)
            .then(expectTargetEntityToBeaLibrary);

        function expectTargetEntityToBeaLibrary( notification ){
            return expect(notification.targetEntity.type).to.equal('LibraryNonCrm');
        }
    });

    it('should expand the targetEntity property to a vendor', function(){
        var testVendor = {
            type: 'Vendor',
            name: 'Test Vendor',
            id: uuid.v4()
        };
        var testNotification = validNotificationData();
        testNotification.targetEntity = testVendor;
        testNotification.notificationType = 'report';

        return vendorRepository.create(testVendor)
            .then(function(){
                return notificationRepository.create(testNotification)
            })
            .then(notificationRepository.load)
            .then(expectTargetEntityToBeaVendor);

        function expectTargetEntityToBeaVendor( notification ){
            return expect(notification.targetEntity.type).to.equal('Vendor');
        }
    });
});

describe('the listDrafts method', function(){
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

describe('the listSentBetweenDates method', function(){
    it('should be a function', function(){
        expect(notificationRepository.listSentBetweenDates).to.be.a('function');
    });

    it('should return an array', function(){
        return notificationRepository.listSentBetweenDates('1970-01-01', '2099-12-31').then(function(notificationList){
            return expect(notificationList).to.be.an('array');
        });
    });

    it('should only return notifications with status sent between the start date and end date', function(){
        var testStartDate = '2000-01-01';
        var testEndDate = '3000-01-01';

        return testUtils.deleteDocumentsOfType('Notification')
            .then(setupTestNotifications)
            .then(testListSentBetweenDatesMethod);

        function setupTestNotifications(){
            var draft1 = validNotificationData();
            var sent1 = validNotificationData();
            var sent2 = validNotificationData();

            sent1.draftStatus = 'sent';
            sent1.dateSent = '1990-01-01';
            sent2.draftStatus = 'sent';
            sent2.dateSent = '2015-01-01';

            return Q.all([
                notificationRepository.create(draft1),
                notificationRepository.create(sent1),
                notificationRepository.create(sent2)
            ]);
        }

        function testListSentBetweenDatesMethod(){
            return notificationRepository.listSentBetweenDates(testStartDate, testEndDate).then(function(notificationList){
                return Q.all([
                    expect(notificationList.length).to.equal(1),
                    expect(notificationList[0].draftStatus).to.equal('sent'),
                    expect(notificationList[0].dateSent).to.equal('2015-01-01')
                ]);
            });
        }
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
        var recipientLabel = notificationRepository.getRecipientLabel('Test Library', 'reminder');
        expect(recipientLabel).to.equal('Test Library Subscription Contacts');
    });
});

describe('the getSummaryTotal method', function () {
    function getTestOfferings() {
        return [
            {
                id: uuid.v4(),
                type: 'Offering',
                library: '',
                selection: {
                    price: 100
                }
            },
            {
                id: uuid.v4(),
                type: 'Offering',
                library: '',
                selection: {
                    price: 100
                }
            }
        ];
    }

    it('should be a repository function', function () {
        expect(notificationRepository.getSummaryTotal).to.be.a('function');
    });

    it('should return the total of all selected prices in the given offerings for a non-fee invoice', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();
        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(200);
    });

    it('should return the total of all annual access fees in the selected products for a fee invoice', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        notification.isFeeInvoice = true;
        offerings[0].product = { oneTimePurchaseAnnualAccessFee: 10 };
        offerings[1].product = { oneTimePurchaseAnnualAccessFee: 20 };

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(30);
    });

    it('should return the total of all annual access fees even if one of them is zero', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        notification.isFeeInvoice = true;
        offerings[0].product = { oneTimePurchaseAnnualAccessFee: 10 };
        offerings[1].product = { oneTimePurchaseAnnualAccessFee: 0 };

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(10);
    });

    it('should only include annual access fees of products that have been purchased', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        notification.isFeeInvoice = true;
        offerings[0].product = { oneTimePurchaseAnnualAccessFee: 10 };
        delete offerings[0].selection;
        offerings[1].product = { oneTimePurchaseAnnualAccessFee: 20 };

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(20);
    });
});

describe('Adding functions to Notification instances', function () {
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
        expect(notificationRepository.notificationTypeIsForLibrary('invoice')).to.equal(true);
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForLibrary('report')).to.equal(false);
    });

    it('should return the correct value for a subscription related notification', function () {
        expect(notificationRepository.notificationTypeIsForLibrary('reminder')).to.equal(true);
    });
});

describe('the notificationTypeIsForInvoice method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeIsForInvoice).to.be.a('function');
    });

    it('should return the correct value for a library invoice', function () {
        expect(notificationRepository.notificationTypeIsForInvoice('invoice')).to.equal(true);
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForInvoice('estimate')).to.equal(false);
    });

    it('should return the correct value for a bogus type', function () {
        expect(notificationRepository.notificationTypeIsForInvoice('foobar')).to.equal(false);
    });
});

describe('the notificationTypeIsForEstimate method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeIsForEstimate).to.be.a('function');
    });

    it('should return the correct value for a library estimate', function () {
        expect(notificationRepository.notificationTypeIsForEstimate('estimate')).to.equal(true);
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForEstimate('report')).to.equal(false);
    });

    it('should return the correct value for a bogus type', function () {
        expect(notificationRepository.notificationTypeIsForEstimate('foobar')).to.equal(false);
    });
});

describe('the notificationTypeIsForReminder method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeIsForReminder).to.be.a('function');
    });

    it('should return the correct value for a library reminder', function () {
        expect(notificationRepository.notificationTypeIsForReminder('reminder')).to.equal(true);
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForReminder('report')).to.equal(false);
    });

    it('should return the correct value for a bogus type', function () {
        expect(notificationRepository.notificationTypeIsForReminder('foobar')).to.equal(false);
    });
});


describe('the notificationTypeIsForVendor method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeIsForVendor).to.be.a('function');
    });

    it('should return the correct value for a library invoice', function () {
        expect(notificationRepository.notificationTypeIsForVendor('invoice')).to.equal(false);
    });

    it('should return the correct value for a vendor report', function () {
        expect(notificationRepository.notificationTypeIsForVendor('report')).to.equal(true);
    });

    it('should return the correct value for a subscription related notification', function () {
        expect(notificationRepository.notificationTypeIsForVendor('reminder')).to.equal(false);
    });
});

describe('the templateIsForAnnualAccessFeeInvoice method', function () {
    it('should be a function', function(){
        expect(notificationRepository.templateIsForAnnualAccessFeeInvoice).to.be.a('function');
    });

    it('should return the correct value for a non-matching template id', function () {
        expect(notificationRepository.templateIsForAnnualAccessFeeInvoice('invoice')).to.equal(false);
    });

    it('should return the correct value for a matching id', function () {
        expect(notificationRepository.templateIsForAnnualAccessFeeInvoice('notification-template-annual-access-fee-invoices')).to.equal(true);
    });

    it('should return the correct value for a bogus id', function () {
        expect(notificationRepository.templateIsForAnnualAccessFeeInvoice('subscription')).to.equal(false);
    });
});
