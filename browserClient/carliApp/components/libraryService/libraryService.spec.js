describe('The Library Service', function() {
    beforeEach(module('carli.libraryService'));

    it( 'should provide libraryService', inject( function(libraryService) {
        expect(libraryService).to.be.an('object');
    }));

    it( 'should provide a list method', inject( function(libraryService) {
        expect(libraryService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(libraryService) {
        expect(libraryService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(libraryService) {
        expect(libraryService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(libraryService) {
        expect(libraryService.load).to.be.a('Function');
    }));

    it( 'should provide a getInstitutionYearsOptions method', inject( function(libraryService) {
        expect(libraryService.getInstitutionYearsOptions).to.be.a('Function');
        expect(libraryService.getInstitutionYearsOptions()).to.be.an('Array');
    }));

    it( 'should provide a getInstitutionTypeOptions method', inject( function(libraryService) {
        expect(libraryService.getInstitutionTypeOptions).to.be.a('Function');
        expect(libraryService.getInstitutionTypeOptions()).to.be.an('Array');
    }));

    it( 'should provide a getMembershipLevelOptions method', inject( function(libraryService) {
        expect(libraryService.getMembershipLevelOptions).to.be.a('Function');
        expect(libraryService.getMembershipLevelOptions()).to.be.an('Array');
    }));

});
