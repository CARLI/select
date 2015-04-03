var chai   = require( 'chai' );
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var notificationDraftGenerator = require('../NotificationDraftGenerator' );
var Q = require('q');

chai.use(chaiAsPromised);

function implementsDraftNotificationInterface(draftNotification) {
    return typeof draftNotification.getAudienceAndSubject === 'function' &&
           typeof draftNotification.getRecipients == 'function' &&
           typeof draftNotification.getNotifications == 'function';
}

describe('The notification draft generator', function() {
    it('should have a generateDraftNotification function', function() {
        expect(notificationDraftGenerator.generateDraftNotification).to.be.a('function');
    });

    describe('specification for generateDraftNotification "One Library, Annual Access Fee"', function() {
        var template = {
            id: 'notification-template-annual-access-fee-invoices',
            notificationType: 'invoice'
        };
        var notificationData = {
            recipientId: 'some library'
        };
        function getMockEntitiesForAnnualAccessFee() {
            return Q({
                libraryFromNotificationData: [{id: 'library', name: 'Test Library'}]
            });
        }
        function getMockOfferingsForAnnualAccessFee(){
            return Q([
                {
                    product: {
                        id: 'product',
                        name: 'Test Product'
                    },
                    library: {
                        id: 'library',
                        name: 'Test Library'
                    },
                    pricing: {
                        site: 0.01
                    },
                    datePurchased: '2015-01-01'
                }
            ]);
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Library, Annual Access Fee');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAnnualAccessFee;

            return draft.getRecipients().then(function(recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Test Library Invoice Contacts')
                ]);
            });
        });

        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getOfferings = getMockOfferingsForAnnualAccessFee;

            return draft.getNotifications().then(function(notifications){
                return expect(notifications).to.be.an('array');
            });
        });
    });

    describe('specification for generateDraftNotification "All Libraries, Annual Access Fee"', function() {
        var template = {
            id: 'notification-template-annual-access-fee-invoices',
            notificationType: 'invoice'
        };
        var notificationData = {};
        function getMockEntitiesForAnnualAccessFee() {
            return Q({
                librariesWithSelections: [{id: 'library-with-selections', name: 'Library with selections'}]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Libraries, Annual Access Fee');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAnnualAccessFee;

            return draft.getRecipients().then(function(recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library-with-selections'),
                    expect(recipients[0].label).to.equal('Library with selections Invoice Contacts')
                ]);
            });
        });
    });

    describe('specification for generateDraftNotification "Reminder"', function() {
        var template = {
            id: 'notification-template-library-reminder',
            notificationType: 'subscription'
        };
        var notificationData = {};

        function getMockEntitiesForReminder() {
            return Q({
                librariesWithSelectionsInCycle: ['library-with-selections'],
                allLibraries: [
                    {id: 'library-with-selections', name: 'Library with selections'},
                    {id: 'library-without-selections', name: 'Library without selections'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('Reminder');

        });
        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForReminder;

            return draft.getRecipients().then(function(recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library-without-selections'),
                    expect(recipients[0].label).to.equal('Library without selections Subscription Contacts')
                ]);
            });
        });
    });

    describe('specification for generateDraftNotification "All Vendors, All Products"', function() {
        var template = {
            id: 'notification-template-vendor-reports',
            notificationType: 'report'
        };
        var notificationData = {};
        function getMockEntitiesForAllVendorsAllProducts() {
            return Q({
                vendorsWithProductsInCycle: [
                    {id: 'vendor', name: 'Vendor'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Vendors, All Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAllVendorsAllProducts;

            return draft.getRecipients().then(function(recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('vendor'),
                    expect(recipients[0].label).to.equal('Vendor Report Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "One or more Vendors, One or more Products"', function() {
        var template = {
            id: 'notification-template-vendor-reports',
            notificationType: 'report'
        };
        var notificationData = {
            offeringIds: [ 1, 2, 3 ]
        };
        function getMockEntitiesForSomeVendorsSomeProducts() {
            return Q({
                vendorsFromSelectedOfferings: [
                    {id: 'vendor', name: 'Vendor'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One or more Vendors, One or more Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForSomeVendorsSomeProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('vendor'),
                    expect(recipients[0].label).to.equal('Vendor Report Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "One Vendor, All Products"', function() {
        var template = {
            id: 'notification-template-vendor-reports',
            notificationType: 'report'
        };
        var notificationData = {
            recipientId: 'some vendor'
        };
        function getMockEntitiesFromNotificationData() {
            return Q({
                vendorFromNotificationData: [ {id: 'vendor', name: 'Vendor'} ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Vendor, All Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesFromNotificationData;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('vendor'),
                    expect(recipients[0].label).to.equal('Vendor Report Contacts')
                ]);
            });
        });
    });

    describe('specification for generateDraftNotification "All Libraries, All Products" Invoices', function() {
        var template = {
            id: 'notification-template-library-invoices',
            notificationType: 'invoice'
        };
        var notificationData = {};
        function getMockEntitiesForAllLibrariesAllProducts() {
            return Q({
                librariesWithSelectionsInCycle: [
                    {id: 'library', name: 'Library'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Libraries, All Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAllLibrariesAllProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Library Invoice Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "One or more Libraries, One or more Products" Invoices', function() {
        var template = {
            id: 'notification-template-library-invoices',
            notificationType: 'invoice'
        };
        var notificationData = {
            offeringIds: [ 1, 2, 3 ]
        };
        function getMockEntitiesForSomeLibrariesSomeProducts() {
            return Q({
                librariesFromOfferings: [
                    {id: 'library', name: 'Library'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One or more Libraries, One or more Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForSomeLibrariesSomeProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Library Invoice Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "One Library, All Products" Invoice', function() {
        var template = {
            id: 'notification-template-library-invoices',
            notificationType: 'invoice'
        };
        var notificationData = {
            recipientId: 'some library'
        };
        function getMockEntitiesForOneLibrariesAllProducts() {
            return Q({
                libraryFromNotificationData: [
                    {id: 'library', name: 'Library'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Library, All Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForOneLibrariesAllProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Library Invoice Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "All Libraries, All Products" Estimates', function() {
        var template = {
            id: 'irrelevant template id',
            notificationType: 'subscription'
        };
        var notificationData = {};
        function getMockEntitiesForAllLibrariesAllProducts() {
            return Q({
                librariesWithSelectionsInCycle: [
                    {id: 'library', name: 'Library'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('All Libraries, All Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAllLibrariesAllProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Library Subscription Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "One or more Libraries, One or more Products" Estimates', function() {
        var template = {
            id: 'irrelevant template id',
            notificationType: 'subscription'
        };
        var notificationData = {
            offeringIds: [ 1, 2, 3 ]
        };
        function getMockEntitiesForSomeLibrariesSomeProducts() {
            return Q({
                librariesFromOfferings: [
                    {id: 'library', name: 'Library'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One or more Libraries, One or more Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForSomeLibrariesSomeProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Library Subscription Contacts')
                ]);
            });
        });
    });
    describe('specification for generateDraftNotification "One Library, All Products" Estimate', function() {
        var template = {
            id: 'irrelevant template id',
            notificationType: 'subscription'
        };
        var notificationData = {
            recipientId: 'some library'
        };
        function getMockEntitiesForOneLibrariesAllProducts() {
            return Q({
                libraryFromNotificationData: [
                    {id: 'library', name: 'Library'}
                ]
            });
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('One Library, All Products');
        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForOneLibrariesAllProducts;

            return draft.getRecipients().then(function (recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Library Subscription Contacts')
                ]);
            });
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
