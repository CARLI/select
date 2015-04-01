var chai   = require( 'chai' );
var expect = chai.expect;
var notificationDraftGenerator = require('../NotificationDraftGenerator' );

function implementsDraftNotificationInterface(draftNotification) {
    return typeof draftNotification.getAudienceAndSubject === 'function';
}

describe('The notification draft generator', function() {
    it('should have a generateDraftNotification function', function() {
        expect(notificationDraftGenerator.generateDraftNotification).to.be.a('function');
    });

    describe('specification for generateDraftNotification "One Library, Annual Access Fee"', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-annual-access-fee-invoices',
                notificationType: 'invoice'
            };
            var notificationData = {
                recipientId: 'some library'
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Library, Annual Access Fee');
        });
    });

    describe('specification for generateDraftNotification "All Libraries, Annual Access Fee"', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-annual-access-fee-invoices',
                notificationType: 'invoice'
            };
            var notificationData = {};
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Libraries, Annual Access Fee');
        });
    });

    describe('specification for generateDraftNotification "Reminder"', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-library-reminder',
                notificationType: 'subscription'
            };
            var notificationData = {};
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('Reminder');
        });
    });

    describe('specification for generateDraftNotification "All Vendors, All Products"', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-vendor-reports',
                notificationType: 'report'
            };
            var notificationData = {};
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Vendors, All Products');
        });
    });
    describe('specification for generateDraftNotification "One or more Vendors, One or more Products"', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-vendor-reports',
                notificationType: 'report'
            };
            var notificationData = {
                offeringIds: [ 1, 2, 3 ]
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One or more Vendors, One or more Products');
        });
    });
    describe('specification for generateDraftNotification "One Vendor, All Products"', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-vendor-reports',
                notificationType: 'report'
            };
            var notificationData = {
                recipientId: 'some vendor'
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Vendor, All Products');
        });
    });

    describe('specification for generateDraftNotification "All Libraries, All Products" Invoices', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-library-invoices',
                notificationType: 'invoice'
            };
            var notificationData = {};
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Libraries, All Products');
        });
    });
    describe('specification for generateDraftNotification "One or more Libraries, One or more Products" Invoices', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-library-invoices',
                notificationType: 'invoice'
            };
            var notificationData = {
                offeringIds: [ 1, 2, 3 ]
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One or more Libraries, One or more Products');
        });
    });
    describe('specification for generateDraftNotification "One Library, All Products" Invoice', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'notification-template-library-invoices',
                notificationType: 'invoice'
            };
            var notificationData = {
                recipientId: 'some library'
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Library, All Products');
        });
    });

    describe('specification for generateDraftNotification "All Libraries, All Products" Estimates', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'irrelevant template id',
                notificationType: 'subscription'
            };
            var notificationData = {};
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Libraries, All Products');
        });
    });
    describe('specification for generateDraftNotification "One or more Libraries, One or more Products" Estimates', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'irrelevant template id',
                notificationType: 'subscription'
            };
            var notificationData = {
                offeringIds: [ 1, 2, 3 ]
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One or more Libraries, One or more Products');
        });
    });
    describe('specification for generateDraftNotification "One Library, All Products" Estimate', function() {
        it('should return a draft notification', function() {
            var template = {
                id: 'irrelevant template id',
                notificationType: 'subscription'
            };
            var notificationData = {
                recipientId: 'some library'
            };
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Library, All Products');
        });
    });
});

//xdescribe('the notificationTypeIsForLibrary method', function () {
//    it('should be a function', function(){
//        expect(notificationRepository.notificationTypeIsForLibrary).to.be.a('function');
//    });
//
//    it('should return the correct value for a library invoice', function () {
//        expect(notificationRepository.notificationTypeIsForLibrary('invoice')).to.be.true;
//    });
//
//    it('should return the correct value for a vendor report', function () {
//        expect(notificationRepository.notificationTypeIsForLibrary('report')).to.be.false;
//    });
//
//    it('should return the correct value for a subscription related notification', function () {
//        expect(notificationRepository.notificationTypeIsForLibrary('subscription')).to.be.true;
//    });
//});
//
//xdescribe('the notificationTypeIsForVendor method', function () {
//    it('should be a function', function(){
//        expect(notificationRepository.notificationTypeIsForVendor).to.be.a('function');
//    });
//
//    it('should return the correct value for a library invoice', function () {
//        expect(notificationRepository.notificationTypeIsForVendor('invoice')).to.be.false;
//    });
//
//    it('should return the correct value for a vendor report', function () {
//        expect(notificationRepository.notificationTypeIsForVendor('report')).to.be.true;
//    });
//
//    it('should return the correct value for a subscription related notification', function () {
//        expect(notificationRepository.notificationTypeIsForVendor('subscription')).to.be.false;
//    });
//});
