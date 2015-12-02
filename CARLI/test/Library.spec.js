var chai   = require('chai');
var expect = chai.expect;
var Entity = require('../Entity');
var LibraryRepository = require('../Entity/LibraryRepository');
var testUtils = require('./utils');
var Q = require('q');

function validLibraryData() {
    return {
        type: 'Library',
        name: 'foo' 
    };
}
function invalidLibraryData() {
    return {
        type: 'Library'
    };
}

//this is required if not running the generic entity interface tests
testUtils.setupTestDb();
LibraryRepository.setStore( testUtils.getTestDbStore() );

var localLibraryRepository = Entity('LibraryNonCrm');
localLibraryRepository.setStore( testUtils.getTestDbStore() );


describe('The LibraryRepository', function(){
    it('should have a load function', function() {
        expect(LibraryRepository.load).to.be.a('function');
    });

    describe('LibraryRepository.load', function() {
        it('should have a load method that combines data from the CARLI CRM and the local database', function(){
            this.timeout(5000);
            var crmId = '2';

            var testNonCrmLibrary = {
                type: 'LibraryNonCrm',
                crmId: crmId,
                fte: 1111,
                contacts: [
                    { firstName: 'test1', email: 'test@test.com', contactType: 'Other' },
                    { firstName: 'test2', email: 'test@test.com', contactType: 'Other' }
                ]
            };

            return localLibraryRepository.create(testNonCrmLibrary)
                .then(function(){
                    return LibraryRepository.load(crmId);
                })
                .then(function(loadedLibrary){
                    return Q.all([
                        expect(loadedLibrary).to.be.an('object').and.have.property('id',crmId),
                        expect(loadedLibrary).to.have.property('fte',testNonCrmLibrary.fte),
                        expect(loadedLibrary.contacts).to.be.an('array').and.have.property('length',2)
                    ]);
                });
        });
    });

    it('should have a list method', function() {
        expect(LibraryRepository.list).to.be.a('function');
    });

    describe('LibraryRepository.list', function() {
        this.timeout(5000);

        it('should list Libraries from the CARLI CRM and the local database', function(){
            var testNonCrmLibrary = {
                type: 'LibraryNonCrm',
                crmId: '4',
                fte: 3333
            };

            return localLibraryRepository.create(testNonCrmLibrary)
                .then(function(){
                    return LibraryRepository.list();
                })
                .then(function(libraryList){
                    return expect(libraryList).to.satisfy(listOfCrmLibrariesCombinedWithNonCrmData);
                });

            function listOfCrmLibrariesCombinedWithNonCrmData(libraryList){
                var testLibrary = libraryList.filter(function(library){
                    return library.id === testNonCrmLibrary.crmId;
                });

                return testLibrary[0].fte === testNonCrmLibrary.fte;
            }
        });
    });

    it('should have a listActiveLibraries method', function(){
        expect(LibraryRepository.listActiveLibraries).to.be.a('function');
    });

    describe('LibraryRepository.listActiveLibraries', function() {
        this.timeout(5000);

        it('should list only active Libraries from the CARLI CRM and the local database', function(){
            return LibraryRepository.listActiveLibraries().then(function(libraryList){
                return expect(libraryList).to.be.an('array').and.to.satisfy(allLibrariesAreActive);
            });


            function allLibrariesAreActive(libraryList){
                return libraryList.every(libraryIsActive);

                function libraryIsActive(library){
                    return library.isActive;
                }
            }
        });
    });

});


describe('Helper functions for getting Enum values from the Library Schema', function(){

    it('should have a getInstitutionTypeOptions function', function(){
        expect(LibraryRepository.getInstitutionTypeOptions).to.be.a('function');
    });

    describe('the getInstitutionTypeOptions function', function(){
        it('should return expected values', function(){
            var testData = [
                "Private",
                "Public",
                "Other"
            ];

            expect(LibraryRepository.getInstitutionTypeOptions()).to.have.members(testData);
        });
    });

    it('should have a getInstitutionYearsOptions function', function(){
        expect(LibraryRepository.getInstitutionYearsOptions).to.be.a('function');
    });

    describe('the getInstitutionYearsOptions function', function(){
        it('should return expected values', function(){
            var testData = [
                "4 Year",
                "2 Year",
                "Other"
            ];

            expect(LibraryRepository.getInstitutionYearsOptions()).to.have.members(testData);
        });
    });

    it('should have a getMembershipLevelOptions function', function(){
        expect(LibraryRepository.getMembershipLevelOptions).to.be.a('function');
    });

    describe('the getMembershipLevelOptions function', function(){
        it('should return expected values', function(){
            var testData = [
                "Governing",
                "Affiliate",
                "Non-Member"
            ];

            expect(LibraryRepository.getMembershipLevelOptions()).to.have.members(testData);
        });
    });
});

describe('the loadNonCrmLibraryForCrmId Couch view', function(){
    it('should have a loadNonCrmLibraryForCrmId method', function(){
        expect(LibraryRepository.loadNonCrmLibraryForCrmId).to.be.a('function');
    });

    it('should return a single LibraryNonCrm object for a crm id', function(){
        var libraryNonCrmRepository = Entity('LibraryNonCrm');
        libraryNonCrmRepository.setStore( testUtils.getTestDbStore() );

        var testLibraryNonCrm = {
            type: 'LibraryNonCrm',
            crmId: '10',
            ipAddresses: 'test'
        };

        return libraryNonCrmRepository.create(testLibraryNonCrm)
            .then(function(){
                return LibraryRepository.loadNonCrmLibraryForCrmId(testLibraryNonCrm.crmId);
            })
            .then(function( libraryNonCrm ){
                return expect(libraryNonCrm).to.be.an('object')
                    .and.have.property('ipAddresses',testLibraryNonCrm.ipAddresses);
            });
    });
});

describe('the listLibrariesWithSelectionsInCycle Couch view', function(){
    it('should have a listLibrariesWithSelectionsInCycle method', function(){
        expect(LibraryRepository.listLibrariesWithSelectionsInCycle).to.be.a('function');
    });

    it('should return an array of library IDs that have made selections in the cycle');
});

describe('getLibrariesById', function(){
    it('should be a function', function(){
        expect(LibraryRepository.getLibrariesById).to.be.a('function');
    })
});


describe('getContactTypesForNotificationCategory', function(){
    var getCategory = LibraryRepository.getContactTypesForNotificationCategory;

    it('should be a function', function(){
        expect(LibraryRepository.getContactTypesForNotificationCategory).to.be.a('function');
    });

    it('should return "Sales" contact type for notification category "Estimate"', function(){
        expect(getCategory(LibraryRepository.CONTACT_CATEGORY_ESTIMATE)).to.be.an('array');
        expect(getCategory(LibraryRepository.CONTACT_CATEGORY_ESTIMATE)[0]).to.equal('Billing');
    });

    it('should return "Sales" contact type for notification category "Invoice"', function(){
        expect(getCategory(LibraryRepository.CONTACT_CATEGORY_INVOICE)[0]).to.equal('Billing');
    });

    it('should return "Sales" contact type for notification category "Reminder"', function(){
        expect(getCategory(LibraryRepository.CONTACT_CATEGORY_REMINDER)[0]).to.equal('Director');
    });

    it('should return "Unknown Category" contact type for a bogus category', function(){
        expect(getCategory('bogus')[0]).to.equal('Unknown Category');
    });
});

describe('getContactEmailAddressesForNotification', function(){
    var listOfContacts = [
        {
            name: 'Test Billing Contact',
            email: 'test_billing@email.com',
            contactType: 'Billing'
        },
        {
            name: 'Test Sales Contact',
            email: 'test_sales@email.com',
            contactType: 'Sales'
        },
        {
            name: 'Test Technical Contact',
            email: 'test_technical@email.com',
            contactType: 'Technical'
        },
        {
            name: 'Test Director Contact',
            email: 'test_director@email.com',
            contactType: 'Director'
        },
        {
            name: 'Test E-Resources Liaison Contact',
            email: 'test_e_resources_liaison@email.com',
            contactType: 'E-Resources Liaison'
        },
        {
            name: 'Test Other Contact',
            email: 'test_other@email.com',
            contactType: 'Other'
        },
        {
            name: 'Test Notification Only Contact',
            email: 'test_notification_only@email.com',
            contactType: 'Notification Only'
        }
    ];

    it('should be a function', function(){
        expect(LibraryRepository.getContactEmailAddressesForNotification).to.be.a('function');
    });

    var getEmail = LibraryRepository.getContactEmailAddressesForNotification;

    it('should return the correct contacts for the Estimate category', function(){
        var testEmails = getEmail(listOfContacts, LibraryRepository.CONTACT_CATEGORY_ESTIMATE);
        expect(testEmails).to.be.an('array');
        expect(testEmails).to.include('test_billing@email.com');
    });

    it('should return the correct contacts for the Invoice category', function(){
        var testEmails = getEmail(listOfContacts, LibraryRepository.CONTACT_CATEGORY_INVOICE);
        expect(testEmails).to.include('test_billing@email.com');
    });

    it('should return the correct contacts for the Reminder category', function(){
        var testEmails = getEmail(listOfContacts, LibraryRepository.CONTACT_CATEGORY_REMINDER);
        expect(testEmails).to.include('test_director@email.com');
    });
});

describe('the listAllContacts method', function(){
    it('should be a function', function(){
        expect(LibraryRepository.listAllContacts).to.be.a('function');
    });

    it.skip('should return an array of contacts', function(){
        this.timeout(5000);
        return LibraryRepository.listAllContacts()
            .then(function(allContacts){
                return Q.all([
                    expect(allContacts).to.be.an('array'),
                    expect(allContacts[0]).to.be.an('object'),
                    expect(allContacts[0].type).to.equal('Contact')
                ]);
            });
    });
});
