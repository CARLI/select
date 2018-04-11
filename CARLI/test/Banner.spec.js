var bannerModule = require('../Banner');
var chai = require('chai');
var config = require('../../config');
var cycleRepository = require('../Entity/CycleRepository');
var Entity = require('../Entity');
var expect = chai.expect;
var fs = require('fs-extra');
var libraryRepository = require('../Entity/LibraryRepository');
var localLibraryRepository = Entity('LibraryNonCrm');
var membershipRepository = require('../Entity/MembershipRepository');
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

var batchIdFileName = config.invoiceDataDir + '/batchId';
var batchIdBackupFileName = config.invoiceDataDir + '/batchId.bak';
var invoiceNumberFileName = config.invoiceDataDir + '/invoiceNumber';
var invoiceNumberBackupFileName = config.invoiceDataDir + '/invoiceNumber.bak';

function backupInvoiceAndBatchFiles() {
    fs.copySync(batchIdFileName, batchIdBackupFileName);
    fs.copySync(invoiceNumberFileName, invoiceNumberBackupFileName);
    //console.log('batch and invoice files backed up');
}

function writeTestInvoiceAndBatchFiles() {
    fs.writeFileSync(batchIdFileName, '0');
    fs.writeFileSync(invoiceNumberFileName, '00AA');
    //console.log('batch and invoice files written with test values');
}

function restoreInvoiceAndBatchFiles() {
    fs.copySync(batchIdBackupFileName, batchIdFileName);
    fs.copySync(invoiceNumberBackupFileName, invoiceNumberFileName);
    fs.removeSync(batchIdBackupFileName);
    fs.removeSync(invoiceNumberBackupFileName);
    //console.log('batch and invoice files restored');
}

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

describe('The Banner Module', function () {
    it('should be a module', function () {
        expect(bannerModule).to.be.an('object');
    });

    it('should have a getDataForBannerExportForSubscriptionCycleAsCsv method', function () {
        expect(bannerModule.getDataForBannerExportForSubscriptionCycleAsCsv).to.be.a('function');
    });

    it('should have a getDataForBannerExportForMembershipDuesAsCsv method', function () {
        expect(bannerModule.getDataForBannerExportForMembershipDuesAsCsv).to.be.a('function');
    });

    it('should have a listBatchesForCycle method', function () {
        expect(bannerModule.listBatchesForCycle).to.be.a('function');
    });
});

describe('Combining line items by detail code', function() {
    it('should be a function', function() {
            expect(bannerModule.collapseBannerRowsByDetailCode).to.be.a('function');
    });

    it('should combine the rows for the same detail code into one', function () {
        var bannerFeedDataByLibraryAndDetailCode = {
            '1': {
                USII: [
                    {
                        batchId: 'USI00001',
                        date: '',
                        library: testLibraryData[0],
                        dollarAmount: 100,
                        detailCode: 'USII',
                        detailCodeFull: 'USII - Fiscal Database',
                        invoiceNumber: 'USIN03AA'
                    },
                    {
                        batchId: 'USI00001',
                        date: '',
                        library: testLibraryData[0],
                        dollarAmount: 100,
                        detailCode: 'USII',
                        detailCodeFull: 'USII - Fiscal Database',
                        invoiceNumber: 'USIN03AA'
                    },
                    {
                        batchId: 'USI00001',
                        date: '',
                        library: testLibraryData[0],
                        dollarAmount: 100,
                        detailCode: 'USII',
                        detailCodeFull: 'USII - Fiscal Database',
                        invoiceNumber: 'USIN03AA'
                    }
                ]
            }
        };

        var expectedOutput = {
            '1': {
                USII: [
                    {
                        batchId: 'USI00001',
                        date: '',
                        library: testLibraryData[0],
                        dollarAmount: 300,
                        detailCode: 'USII',
                        detailCodeFull: 'USII - Fiscal Database',
                        invoiceNumber: 'USIN03AA'
                    }
                ]
            }
        };

        var actualOutput = bannerModule.collapseBannerRowsByDetailCode(bannerFeedDataByLibraryAndDetailCode);

        expect(actualOutput).to.deep.equal(expectedOutput);
    });

    it('ignores empty arrays for detail codes', function () {
        var bannerFeedDataByLibraryAndDetailCode = {
            '1': {
                USII: []
            }
        };

        var expectedOutput = {
            '1': {
                USII: []
            }
        };

        var actualOutput = bannerModule.collapseBannerRowsByDetailCode(bannerFeedDataByLibraryAndDetailCode);

        expect(actualOutput).to.deep.equal(expectedOutput);
    });
});

describe('A Full Subscription Cycle Banner Export Integration Test', function () {
    it('exports a valid banner feed', function () {
        return cycleRepository.create(testCycleData)
            .then(cycleRepository.load)
            .then(runSubscriptionCycleBannerExportIntegrationTest);
    });

    function runSubscriptionCycleBannerExportIntegrationTest(cycle) {
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
            return Q.all(testOfferingData.map(createOffering));

            function createOffering(testOffering) {
                return offeringRepository.create(testOffering, cycle);
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

            var batchId = null;

            backupInvoiceAndBatchFiles();
            writeTestInvoiceAndBatchFiles();

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
                    restoreInvoiceAndBatchFiles();
                    return batchId;
                });
        }

        function generateBannerFeed(batchId) {
            return bannerModule.getDataForBannerExportForSubscriptionCycleAsPackedText(cycle, batchId);
        }

        function debugBannerFeed(bannerFeedData) {
            fs.writeFileSync('banner.txt', bannerFeedData, 'utf8');
            return bannerFeedData;
        }

        function verifyBannerFeed(bannerFeedData) {
            var bannerFeedLines = bannerFeedData.split('\n');

            //                     2USI00001@01460518         9CARLI                        USII000000900.00          USIN03AA
            var bannerFileRegex = /2USI00001@[0-9]{8}         9CARLI                        USII0[0-9]{8}.00          USIN0\dAA\s{62}/;

            return Q.all([
                expect(bannerFeedLines.length).to.equal(4), //header plus 3 library + detail code lines
                expect(bannerFeedLines[0]).to.equal('1USI00001' + batchCreationDate() + '00003000018700.009CARLI  \r'),
                expect(bannerFeedLines[1]).to.match(bannerFileRegex),
                expect(bannerFeedLines[2]).to.match(bannerFileRegex),
                expect(bannerFeedLines[3]).to.match(bannerFileRegex)
            ]);
        }
    }
});

describe.only('A Membership Year Banner Export Integration Test', function () {
    var testMembershipYear = 2020;

    it('exports a valid banner feed', function () {
        return arrangeTestData()
            .then(generateInvoices)
            .then(generateBannerFeed)
            .then(verifyBannerFeed)
    });

    function arrangeTestData(){
        var testMembershipData = {
            type: 'Membership',
            year: testMembershipYear,
            data: {
                "1": { ishare: 100, membership: 200 },
                "3": { membership: 400 },
                "58": { ishare: 600 }
            }
        };

        return membershipRepository.create(testMembershipData);
    }

    function generateInvoices() {
        var notificationTemplate = {
            id: 'notification-template-membership-invoices',
            templateId: 'notification-template-membership-invoices',
            name: 'Membership Invoices',
            subject: 'Membership Invoices',
            emailBody: '',
            pdfBefore: 'This text appears before the invoice contents',
            pdfAfter: 'This text appears after the invoice contents',
            pdfContentIsEditable: true,
            notificationType: 'invoice'
        };

        var notificationData = {
            fiscalYear: testMembershipYear
        };

        var batchId = null;

        backupInvoiceAndBatchFiles();
        writeTestInvoiceAndBatchFiles();

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
                restoreInvoiceAndBatchFiles();
                return batchId;
            });
    }

    function generateBannerFeed(batchId) {
        return bannerModule.getDataForBannerExportForMembershipDuesAsPackedText(testMembershipYear, batchId);
    }

    function verifyBannerFeed(bannerFeedData){
        var count = 4; // 2 membership invoice rows and 2 ishare invoice rows
        var totalRows = count + 1; // add one for header

        var bannerFeedLines = bannerFeedData.split('\n');

        var bannerFileRegex = /2USI00001@[0-9]{8}         9CARLI                        USI.0[0-9]{8}.00          USIN0\dAA\s{62}/;

        return Q.all([
            expect(bannerFeedLines.length).to.equal(totalRows),
            expect(bannerFeedLines[0]).to.equal('1USI00001'+batchCreationDate() + '0000'+count+'000001300.009CARLI  \r'),
            expect(bannerFeedLines[1]).to.match(bannerFileRegex),
            expect(bannerFeedLines[2]).to.match(bannerFileRegex),
            expect(bannerFeedLines[3]).to.match(bannerFileRegex),
            expect(bannerFeedLines[4]).to.match(bannerFileRegex)
        ]);
    }
});

function batchCreationDate() {
    var d = new Date();
    var mm = d.getMonth() + 1;
    var dd = d.getDate();

    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }

    return '' + mm + dd + d.getFullYear();
}
