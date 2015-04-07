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
        /* The recipientId in the notification data is required for the real getEntities to know the recipient,
           however we are not unit testing getEntities (the recipient is mocked in getMockEntitiesForAnnualAccessFee below) */
        var notificationData = {
            recipientId: 'library'
        };
        function getMockEntitiesForAnnualAccessFee() {
            return Q([{id: 'library', name: 'Test Library'}]);
        }
        function getMockOfferingsForAnnualAccessFee(){
            return Q([
                { library: { id: 'library', name: 'Test Library'}, selection: { } },
                { library: { id: 'library', name: 'Test Library'} },
                { library: {id: 'library2', name: 'Test Library2'} }
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
            draft.getEntities = getMockEntitiesForAnnualAccessFee;
            draft.getOfferings = getMockOfferingsForAnnualAccessFee;

            var customizedRecipients = [ 'library' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(1),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('library'),
                    expect(notifications[0].offerings).to.be.an('array'),
                    expect(notifications[0].offerings.length).to.equal(1)
                ]);
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
            return Q([{id: 'library', name: 'Test Library'}]);
        }
        function getMockOfferingsForAnnualAccessFee(){
            return Q([
                { library: { id: 'library', name: 'Test Library'}, selection: {} },
                { library: { id: 'library', name: 'Test Library'} },
                { library: {id: 'library2', name: 'Test Library2'} }
            ]);
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
                    expect(recipients[0].id).to.equal('library'),
                    expect(recipients[0].label).to.equal('Test Library Invoice Contacts')
                ]);
            });
        });
        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAnnualAccessFee;
            draft.getOfferings = getMockOfferingsForAnnualAccessFee;

            var customizedRecipients = [ 'library' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(1),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('library'),
                    expect(notifications[0].offerings).to.be.an('array'),
                    expect(notifications[0].offerings.length).to.equal(1)
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

        function getMockLibrariesWithSelectionsForReminder() {
            return Q(['library-with-selections']);
        }
        function getMockAllLibrariesForReminder() {
            return Q([
                    {id: 'library-with-selections', name: 'Library with selections'},
                    {id: 'library-without-selections', name: 'Library without selections'}
                ]);
        }

        it('should return a draft notification', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            expect(draft).to.satisfy(implementsDraftNotificationInterface);
            expect(draft.getAudienceAndSubject()).to.equal('Reminder');

        });

        it('should generate a recipients list', function() {
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getLibrariesWithSelections = getMockLibrariesWithSelectionsForReminder;
            draft.getAllLibraries = getMockAllLibrariesForReminder;

            return draft.getRecipients().then(function(recipients) {
                return Q.all([
                    expect(recipients).to.be.an('array'),
                    expect(recipients.length).to.equal(1),
                    expect(recipients[0].id).to.equal('library-without-selections'),
                    expect(recipients[0].label).to.equal('Library without selections Subscription Contacts')
                ]);
            });
        });

        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getLibrariesWithSelections = getMockLibrariesWithSelectionsForReminder;
            draft.getAllLibraries = getMockAllLibrariesForReminder;

            var customizedRecipients = [ 'library' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(1),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('library')
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
            return Q([
                {id: 'vendor1', name: 'Vendor1'},
                {id: 'vendor2', name: 'Vendor2'}
            ]);
        }

        function getMockOfferingsForAllVendorsAllProducts(){
            return Q([
                { product: { id: 'product1', vendor: 'vendor1' }, selection: {} },
                { product: { id: 'product1', vendor: 'vendor1' }, selection: {} },
                { product: { id: 'product2', vendor: 'vendor2' }, selection: {} },
                { product: { id: 'product2', vendor: 'vendor2' }, selection: {} }
            ]);
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
                    expect(recipients.length).to.equal(2),
                    expect(recipients[0].id).to.equal('vendor1'),
                    expect(recipients[0].label).to.equal('Vendor1 Report Contacts')
                ]);
            });
        });

        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForAllVendorsAllProducts;
            draft.getOfferings = getMockOfferingsForAllVendorsAllProducts;

            var customizedRecipients = [ 'vendor1', 'vendor2' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(2),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('vendor1'),
                    expect(notifications[0].offerings).to.be.an('array'),
                    expect(notifications[0].offerings.length).to.equal(2)
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
            return Q([{id: 'vendor', name: 'Vendor'}]);
        }

        function getMockOfferingsForSomeVendorsSomeProducts(){
            return Q([
                { product: { id: 'product1', vendor: 'vendor1' }, selection: {} },
                { product: { id: 'product1', vendor: 'vendor1' }, selection: {} },
                { product: { id: 'product2', vendor: 'vendor2' }, selection: {} },
                { product: { id: 'product2', vendor: 'vendor2' }, selection: {} }
            ]);
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

        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForSomeVendorsSomeProducts;
            draft.getOfferings = getMockOfferingsForSomeVendorsSomeProducts;

            var customizedRecipients = [ 'vendor1', 'vendor2' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(2),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('vendor1'),
                    expect(notifications[0].offerings).to.be.an('array'),
                    expect(notifications[0].offerings.length).to.equal(2)
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
            return Q( [ {id: 'vendor', name: 'Vendor'} ]);
        }

        function getMockOfferingsForOneVendorAllProducts(){
            return Q([
                { product: { id: 'product1', vendor: 'vendor1' }, selection: {} },
                { product: { id: 'product1', vendor: 'vendor1' }, selection: {} }
            ]);
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

        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesFromNotificationData;
            draft.getOfferings = getMockOfferingsForOneVendorAllProducts;

            var customizedRecipients = [ 'vendor1' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(1),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('vendor1'),
                    expect(notifications[0].offerings).to.be.an('array'),
                    expect(notifications[0].offerings.length).to.equal(2)
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
            return Q([{id: 'library', name: 'Library'}]);
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
            return Q([{id: 'library', name: 'Test Library'}]);
        }
        function getMockOfferingsForSomeLibrariesSomeProducts(){
            return Q([
                { library: { id: 'library', name: 'Test Library'}, selection: { } },
                { library: { id: 'library', name: 'Test Library'} },
                { library: { id: 'library2', name: 'Test Library2'} }
            ]);
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
                    expect(recipients[0].label).to.equal('Test Library Invoice Contacts')
                ]);
            });
        });

        it('should generate a list of notification objects', function(){
            var draft = notificationDraftGenerator.generateDraftNotification(template, notificationData);
            draft.getEntities = getMockEntitiesForSomeLibrariesSomeProducts;
            draft.getOfferings = getMockOfferingsForSomeLibrariesSomeProducts;

            var customizedRecipients = [ 'library' ];

            return draft.getNotifications(template, customizedRecipients).then(function(notifications){
                return Q.all([
                    expect(notifications).to.be.an('array'),
                    expect(notifications.length).to.equal(1),
                    expect(notifications[0].type).to.equal('Notification'),
                    expect(notifications[0].targetEntity).to.equal('library'),
                    expect(notifications[0].offerings).to.be.an('array'),
                    expect(notifications[0].offerings.length).to.equal(1)
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
            return Q([{id: 'library', name: 'Library'}]);
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
            return Q([{id: 'library', name: 'Library'}]);
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
            return Q([{id: 'library', name: 'Library'}]);
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
            return Q([{id: 'library', name: 'Library'}]);
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
