var chai   = require( 'chai' )
  , expect = chai.expect
  , test = require( './Entity/EntityInterface.spec' )
  , Entity = require('../Entity')
  , LibraryRepository = require('../Entity/LibraryRepository' )
  , testUtils = require('./utils')
  ;

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

describe('The LibraryRepository', function(){
    it('should have a load function', function() {
        expect(LibraryRepository.load).to.be.a('function');
    });

    describe('LibraryRepository.load', function() {
        it('should have a load method that combines data from the CARLI CRM and the local database', function(){
            return LibraryRepository.load(1).then(function(loadedLibrary){
                return expect(loadedLibrary).to.be.an('object').and.have.property('id',1);
            });
        });
    });

    it('should have a list method', function() {
        expect(LibraryRepository.list).to.be.a('function');
    });

    describe('LibraryRepository.list', function() {
        it('should list Libraries from the CARLI CRM and the local database', function(){
            return LibraryRepository.list().then(function(libraryList){
                return expect(libraryList).to.be.an('array');
            });
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
            crmId: 1,
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
        expect(vendorRepository.getLibrariesById).to.be.a('function');
    })
});
