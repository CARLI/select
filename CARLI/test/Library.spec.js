var chai   = require( 'chai' )
  , expect = chai.expect
  , test = require( './Entity/EntityInterface.spec' )
  , LibraryRepository = require('../Entity/LibraryRepository' )
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

// test.run('Library', validLibraryData, invalidLibraryData);

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
