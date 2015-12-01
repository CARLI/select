var bannerModule = require('../Banner');
var chai = require('chai');
var config = require('../../config');
var cycleRepository = require('../Entity/CycleRepository');
var Entity = require('../Entity');
var expect = chai.expect;
var libraryRepository = require('../Entity/LibraryRepository');
var localLibraryRepository = Entity('LibraryNonCrm');
var notificationDraftGenerator = require('../NotificationDraftGenerator');
var notificationRepository = require('../Entity/NotificationRepository');
var offeringRepository = require('../Entity/OfferingRepository');
var productRepository = require('../Entity/ProductRepository');
var Q = require('q');
var request = require('request');
var testUtils = require('./utils');
var uuid = require('node-uuid');
var vendorRepository = require('../Entity/VendorRepository');

localLibraryRepository.setStore(testUtils.getTestDbStore());
testUtils.setupTestDb();

var testCycleId = testUtils.testDbMarker + ' Banner Test Fiscal Year ' + uuid.v4();

var testCycleData = {
    type: 'Cycle',
    id: testCycleId,
    name: testCycleId,
    cycleType: 'Fiscal Year',
    year: 3001,
    status: 0,
    isArchived: false
};

var testVendorData = {
    alexanderSt: {
        type: 'Vendor',
        id: uuid.v4(),
        name: 'Alexander Street Press'
    },
    ebsco: {
        type: 'Vendor',
        id: uuid.v4(),
        name: 'Ebsco'
    },
    ovid: {
        type: 'Vendor',
        id: uuid.v4(),
        name: 'Ovid'
    }
};

var testProductData = {
    artAndArch: {
        type: 'Product',
        id: uuid.v4(),
        name: 'Art and Architecture in Video',
        detailCode: 'USII - Fiscal Database',
        isActive: true,
        vendor: testVendorData.alexanderSt.id,
        cycle: testCycleId
    },
    americanArt: {
        type: 'Product',
        id: uuid.v4(),
        name: '19th Century American Art Periodicals',
        detailCode: 'USII - Fiscal Database',
        isActive: true,
        vendor: testVendorData.ebsco.id,
        cycle: testCycleId
    },
    agricola: {
        type: 'Product',
        id: uuid.v4(),
        name: 'Agricola',
        detailCode: 'USII - Fiscal Database',
        isActive: true,
        vendor: testVendorData.ovid.id,
        cycle: testCycleId
    }
};

var testLibraryData = [
    {
        crmId: '1',
        gar: '@01460518',
        type: 'LibraryNonCrm'
    },
    {
        crmId: '3',
        gar: '@00874612',
        type: 'LibraryNonCrm'
    },
    {
        crmId: '58',
        gar: '@00875304',
        type: 'LibraryNonCrm'
    }
];

var testOfferingData = [
    //Abraham Lincoln
    {
        library: '1',
        product: testProductData.artAndArch,
        pricing: {site: 900},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    {
        library: '1',
        product: testProductData.americanArt,
        pricing: {site: 1200},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    {
        library: '1',
        product: testProductData.agricola,
        pricing: {site: 4200},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    //Augustana
    {
        library: '3',
        product: testProductData.artAndArch,
        pricing: {site: 1000},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    {
        library: '3',
        product: testProductData.americanArt,
        pricing: {site: 1200},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    {
        library: '3',
        product: testProductData.agricola,
        pricing: {site: 4200},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    //Knox
    {
        library: '58',
        product: testProductData.artAndArch,
        pricing: {site: 600},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    {
        library: '58',
        product: testProductData.americanArt,
        pricing: {site: 1200},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    },
    {
        library: '58',
        product: testProductData.agricola,
        pricing: {site: 4200},
        selection: {users: offeringRepository.siteLicenseSelectionUsers, price: 900}
    }
];

describe.only('A Full Cycle Banner Export Integration Test', function () {
    /** TODO: REMOVE ONLY!!!!!!!!!!!!!!!!!!!! **/
    it('exports a valid banner invoice', function () {
        return cycleRepository.create(testCycleData)
            .then(cycleRepository.load)
            .then(function (testCycle) {
                return runBannerExportIntegrationTest(testCycle);
            });
    });

    function runBannerExportIntegrationTest(cycle) {
        return setupTestVendors()
            .then(setupTestProducts)
            .then(setupTestLibraryData)
            .then(setupTestOfferings)
            .then(generateInvoices)
            .then(generateBannerFeed)
            //.then(debugBannerFeed)
            .then(verifyBannerFeed);

        function setupTestVendors() {
            var vendors = Object.keys(testVendorData).map(function (id) {
                return testVendorData[id]
            });
            return Q.all(vendors.map(vendorRepository.create));
        }

        function setupTestProducts() {
            return Q.all(Object.keys(testProductData).map(createProduct));

            function createProduct(testProductId) {
                return productRepository.create(testProductData[testProductId], cycle);
            }
        }

        function setupTestLibraryData() {
            return testLibraryData.map(localLibraryRepository.create);
        }

        function setupTestOfferings() {
            return Q.all(Object.keys(testOfferingData).map(createOffering));

            function createOffering(testOfferingId) {
                return offeringRepository.create(testOfferingData[testOfferingId], cycle);
            }
        }

        function generateInvoices() {
            var notificationTemplate = {
                id: 'notification-template-library-invoices',
                name: 'Library Invoices',
                subject: 'CARLI Database Invoices',
                emailBody: '',
                pdfBefore: 'This text appears before the invoice contents',
                pdfAfter: 'This text appears after the invoice contents',
                pdfContentIsEditable: true,
                notificationType: 'invoice'
            };

            var notificationData = {
                cycleId: cycle.id
            };

            batchId = null;

            var generator = notificationDraftGenerator.generateDraftNotification(notificationTemplate, notificationData);

            return generator.getRecipients()
                .then(function (recipients) {
                    var recipientIds = recipients.map(function (e) {
                        return e.id
                    });
                    return generator.getNotifications(notificationTemplate, recipientIds);
                })
                .then(function (notifications) {
                    batchId = notifications[0].batchId;
                    return Q.all(notifications.map(notificationRepository.create));
                })
                .then(function () {
                    return batchId;
                });
        }

        function generateBannerFeed(batchId) {
            return bannerModule.getDataForBannerExport(cycle, batchId);
        }

        function debugBannerFeed(bannerFeedData) {
            console.log('--------------------------------------------------------------------------------');
            console.log('                                        BANNER FEED');
            console.log('--------------------------------------------------------------------------------');

            console.log(typeof bannerFeedData);

            console.log(bannerFeedData);
            console.log('--------------------------------------------------------------------------------');

            return bannerFeedData;
        }

        function verifyBannerFeed(bannerFeedData) {
            return expect(bannerFeedData).to.satisfy(validBannerFeed);

            function validBannerFeed(data) {
                return false;
            }
        }
    }


});

