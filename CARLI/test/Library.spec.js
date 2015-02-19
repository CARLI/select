var chai   = require( 'chai' )
  , expect = chai.expect
  , test = require( './Entity/EntityInterface.spec' )
  , Entity = require('../Entity')
  , LibraryRepository = require('../Entity/LibraryRepository' )
  , testUtils = require('./utils')
  ;

testUtils.setupTestDb();
LibraryRepository.setStore( testUtils.getTestDbStore() );

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

// test.run('Library', validLibraryData, invalidLibraryData);

describe('The special Library Entity', function(){
    it('should load library data from MySql and Couch', function(){

    });

    it('have a list method');
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
