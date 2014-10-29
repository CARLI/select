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
});
