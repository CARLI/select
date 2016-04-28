var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var notificationRepository = require('../Entity/NotificationRepository');
var test = require('./Entity/EntityInterface.spec');
var testUtils = require('./utils');
var Q = require('q');
var uuid = require('node-uuid');
var vendorRepository = require('../Entity/VendorRepository');

chai.use(chaiAsPromised);

testUtils.setupTestDb();

function validNotificationData() {
    return {
        type: 'Notification',
        subject: 'Test subject',
        emailBody: 'To whom it may concern: Hi there. Yours sincerely, CARLI',
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
            return expect(notification.targetEntity.type).to.equal('Library');
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

describe('The sendNotification method', function(){
    it('should be a function', function(){
        expect(notificationRepository.sendNotification).to.be.a('function');
    });

    it('should update the status of the notification to sent', function(){
        var testNotification = validNotificationData();

        return createAndSendNotification(testNotification)
            .then(function(notification){
                return expect(notification.draftStatus).to.equal('sent');
            });
    });

    it('should set the "to" field to the contact email addresses for a vendor report', function(){
        var testVendor = {
            type: 'Vendor',
            id: uuid.v4(),
            name: 'Test Vendor For Sending Notifications',
            contacts: [{
                name: 'test report contact',
                email: 'report@test.com',
                contactType: 'Sales'
            }]
        };

        var testNotification = validNotificationData();
        testNotification.targetEntity = testVendor.id;
        testNotification.notificationType = 'report';

        return vendorRepository.create(testVendor)
            .then(function(){
                return createAndSendNotification(testNotification);
            })
            .then(function(notification){
                return Q.all([
                    expect(notification.draftStatus).to.equal('sent'),
                    expect(notification.to).to.equal('report@test.com')
                ]);
            })
    });

    it('should leave the "to" field alone if the notification does not have a targetEntity', function(){
        var testNotification = validNotificationData();
        testNotification.to = uuid.v4();

        return createAndSendNotification(testNotification)
            .then(function(notification) {
                return Q.all([
                    expect(notification.draftStatus).to.equal('sent'),
                    expect(notification.to).to.equal(testNotification.to)
                ]);
            });
    });

    it('should reject if the Notification was already sent', function(){
        var testNotification = validNotificationData();

        return expect(sendNotificationTwice()).to.be.rejected;

        function sendNotificationTwice(){
            return createAndSendNotification(testNotification)
                .then(notificationRepository.sendNotification);
        }
    });

    function createAndSendNotification(notification){
        return notificationRepository.create(notification)
            .then(notificationRepository.load)
            .then(notificationRepository.sendNotification)
            .then(notificationRepository.load);
    }
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
        expect(recipientLabel).to.equal('Test Library Reminder Contacts');
    });
});

describe('the getRecipientEmailAddresses method', function () {
    it('should be a function', function(){
        expect(notificationRepository.getRecipientEmailAddresses).to.be.a('function');
    });

    it('should return the correct label for a vendor report');
    //sadly, this relies on CRM data, which is not easily modified or mocked.

    it('should return the correct label for a vendor report', function () {
        var testVendor = {
            type: 'Vendor',
            id: uuid.v4(),
            name: 'Test Vendor',
            contacts: [{
                name: 'test contact',
                email: 'test@email.com',
                contactType: 'Sales'
            }]
        };
        return vendorRepository.create(testVendor)
            .then(function(){
                return notificationRepository.getRecipientEmailAddresses(testVendor.id, 'report');
            })
            .then(function(recipientEmail){
                return Q.all([
                    expect(recipientEmail).to.be.an('array'),
                    expect(recipientEmail[0]).to.equal('test@email.com')
                ]);
            });
    });
});

describe('the getSummaryTotal method', function () {
    function getTestOfferings() {
        return [
            {
                id: uuid.v4(),
                type: 'Offering',
                library: '',
                pricing: {
                    su: [ {
                        users: 4,
                        price: 100
                    } ]
                },
                selection: {
                    users: 4
                }
            },
            {
                id: uuid.v4(),
                type: 'Offering',
                library: '',
                pricing: {
                su: [ {
                        users: 4,
                        price: 100
                    } ]
                },
                selection: {
                    users: 4
                }
            }
        ];
    }

    var fiftyPercentFunded = {
        fundedByPercentage: true,
        fundedPercent: 50
    };
    var zeroPercentFunded = {
        fundedByPercentage: true,
        fundedPercent: 0
    };

    it('should be a repository function', function () {
        expect(notificationRepository.getSummaryFundedTotal).to.be.a('function');
    });

    it('should return the total of all selected prices in the given offerings for a non-fee invoice', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();
        expect(notificationRepository.getSummaryFundedTotal(notification, offerings)).to.equal(200);
    });

    it('should return treat 0% funding the same as full price', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = zeroPercentFunded;
        offerings[1].funding = zeroPercentFunded;

        expect(notificationRepository.getSummaryFundedTotal(notification, offerings)).to.equal(200);
    });

    it('should reflect the reduction in price when a percentage is funded by CARLI', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = fiftyPercentFunded;

        expect(notificationRepository.getSummaryFundedTotal(notification, offerings)).to.equal(150);
    });

    it('should round prices independently when calculating funded price', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].pricing.su[0].price = 10.33;
        offerings[0].funding = fiftyPercentFunded;
        offerings[1].pricing.su[0].price = 10.33;
        offerings[1].funding = fiftyPercentFunded;

        expect(notificationRepository.getSummaryFundedTotal(notification, offerings)).to.equal(10.34);
    });

    it('should reflect the discounted price when a product is funded to a fixed amount', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = {
            fundedByPercentage: false,
            fundedPrice: 25
        };

        expect(notificationRepository.getSummaryFundedTotal(notification, offerings)).to.equal(125);
    });

    it('should treat a fixed price of zero as not funded', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = {
            fundedByPercentage: false,
            fundedPrice: 0
        };
        offerings[1].funding = {
            fundedByPercentage: false,
            fundedPrice: 0
        };

        expect(notificationRepository.getSummaryFundedTotal(notification, offerings)).to.equal(200);
    });

    it('should be a repository function', function () {
        expect(notificationRepository.getSummaryTotal).to.be.a('function');
    });

    it('should return the total of all selected prices in the given offerings for a non-fee invoice', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();
        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(200);
    });

    it('should return treat 0% funding the same as full price', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = zeroPercentFunded;
        offerings[1].funding = zeroPercentFunded;

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(200);
    });

    it('should NOT reflect the reduction in price when a percentage is funded by CARLI', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = fiftyPercentFunded;

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(200);
    });

    it('should NOT reflect the discounted price when a product is funded to a fixed amount', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = {
            fundedByPercentage: false,
            fundedPrice: 25
        };

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(200);
    });

    it('should treat a fixed price of zero as not funded', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        offerings[0].funding = {
            fundedByPercentage: false,
            fundedPrice: 0
        };
        offerings[1].funding = {
            fundedByPercentage: false,
            fundedPrice: 0
        };

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(200);
    });

    it('should return the total of all annual access fees in the selected products for a fee invoice', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        notification.isFeeInvoice = true;
        offerings[0].oneTimePurchaseAnnualAccessFee = 10;
        offerings[1].oneTimePurchaseAnnualAccessFee = 20;

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(30);
    });

    it('should return the total of all annual access fees even if one of them is zero', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        notification.isFeeInvoice = true;
        offerings[0].oneTimePurchaseAnnualAccessFee = 10;
        offerings[1].oneTimePurchaseAnnualAccessFee = 0;

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(10);
    });

    it('should only include annual access fees of products that have been purchased', function () {
        var notification = validNotificationData();
        var offerings = getTestOfferings();

        notification.isFeeInvoice = true;
        offerings[0].oneTimePurchaseAnnualAccessFee = 10;
        delete offerings[0].selection;
        offerings[1].oneTimePurchaseAnnualAccessFee = 20;

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(20);
    });

    it('should return the sum of dues from fake offerings if the notification is for membership dues', function(){
        var notification = validNotificationData();
        notification.isMembershipDuesInvoice = true;

        var offerings = [
            {
                pricing: {
                    ishare: 100,
                    membership: 100
                }
            },
            {
                pricing: {
                    ishare: 100,
                    membership: 100
                }
            }
        ];

        expect(notificationRepository.getSummaryTotal(notification, offerings)).to.equal(400);
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

describe('the templateIsForMembershipDues method', function () {
    it('should be a function', function(){
        expect(notificationRepository.templateIsForMembershipDues).to.be.a('function');
    });

    it('should return the correct value for a non-matching template id', function () {
        expect(notificationRepository.templateIsForMembershipDues('notification-template-annual-access-fee-invoices')).to.equal(false);
    });

    it('should return the correct value for membership invoices', function () {
        expect(notificationRepository.templateIsForMembershipDues('notification-template-membership-invoices')).to.equal(true);
    });

    it('should return the correct value for membership estimates', function () {
        expect(notificationRepository.templateIsForMembershipDues('notification-template-membership-estimates')).to.equal(true);
    });

    it('should return the correct value for a bogus id', function () {
        expect(notificationRepository.templateIsForMembershipDues('subscription')).to.equal(false);
    });
});


describe('the templateIsForMembershipInvoices method', function () {
    it('should be a function', function(){
        expect(notificationRepository.templateIsForMembershipInvoices).to.be.a('function');
    });

    it('should return the correct value for a non-matching template id', function () {
        expect(notificationRepository.templateIsForMembershipInvoices('notification-template-annual-access-fee-invoices')).to.equal(false);
    });

    it('should return true membership invoices', function () {
        expect(notificationRepository.templateIsForMembershipInvoices('notification-template-membership-invoices')).to.equal(true);
    });

    it('should return false for membership estimates', function () {
        expect(notificationRepository.templateIsForMembershipInvoices('notification-template-membership-estimates')).to.equal(false);
    });

    it('should return false for a bogus id', function () {
        expect(notificationRepository.templateIsForMembershipInvoices('subscription')).to.equal(false);
    });
});

describe('the notificationTypeAllowsRecipientsToBeEdited method', function () {
    it('should be a function', function(){
        expect(notificationRepository.notificationTypeAllowsRecipientsToBeEdited).to.be.a('function');
    });

    it('should return false for a library invoice', function () {
        expect(notificationRepository.notificationTypeAllowsRecipientsToBeEdited('invoice')).to.equal(false);
    });

    it('should return false for a vendor report', function () {
        expect(notificationRepository.notificationTypeAllowsRecipientsToBeEdited('report')).to.equal(false);
    });

    it('should return true value for "other"', function () {
        expect(notificationRepository.notificationTypeAllowsRecipientsToBeEdited('other')).to.equal(true);
    });
});

describe('the listAllContacts method', function(){
    it('should be a function', function(){
        expect(notificationRepository.listAllContacts).to.be.a('function');
    });

    it('should return an array of contacts', function(){
        this.timeout(5000);
        return notificationRepository.listAllContacts()
            .then(function(allContacts){
                return expect(allContacts).to.be.an('array');
            });
    });
});

describe('the listInvoiceNotificationsForMembershipYear method', function(){
    it('should be a function', function(){
        expect(notificationRepository.listInvoiceNotificationsForMembershipYear).to.be.a('function');
    });

    it('should return notifications for the membership year', function(){
        return arrangeTestNotifications()
            .then(doTestQuery)
            .then(validateQueryResults);

        function arrangeTestNotifications(){
            return Q.all([
                {
                    type: 'Notification',
                    subject: 'Test subject',
                    emailBody: 'A generic "other" notification. Not included.',
                    draftStatus: 'draft',
                    notificationType: 'other'
                },
                {
                    type: 'Notification',
                    subject: 'Test subject',
                    emailBody: 'A regular subscription cycle product invoice. Not included.',
                    draftStatus: 'draft',
                    notificationType: 'invoice',
                    targetEntity: '1',
                    cycle: 'a-bogus-cycle-id',
                    batchId: '001'
                },
                {
                    type: 'Notification',
                    subject: 'Test subject',
                    emailBody: 'An annual access fee invoice. Not included.',
                    draftStatus: 'draft',
                    notificationType: 'invoice',
                    targetEntity: '1',
                    isFeeInvoice: true,
                    cycle: 'a-bogus-cycle-id',
                    batchId: '002'
                },
                {
                    type: 'Notification',
                    subject: 'Test Subject',
                    emailBody: 'A membership dues invoice for the wrong year. Not included.',
                    draftStatus: 'draft',
                    notificationType: 'invoice',
                    targetEntity: '1',
                    cycle: "",
                    batchId: '003',
                    isMembershipDuesInvoice: true,
                    fiscalYear: 2015
                },
                {
                    type: 'Notification',
                    subject: 'Membership',
                    emailBody: 'A membership dues invoice. Should be included.',
                    draftStatus: 'draft',
                    notificationType: 'invoice',
                    targetEntity: '1',
                    cycle: "",
                    batchId: '004',
                    isMembershipDuesInvoice: true,
                    fiscalYear: 2016
                }
            ].map(notificationRepository.create));
        }

        function doTestQuery(){
            return notificationRepository.listInvoiceNotificationsForMembershipYear(2016);
        }

        function validateQueryResults(queryResults){
            return expect(queryResults).to.be.an('array').and.have.property('length',1);
        }
    });
});