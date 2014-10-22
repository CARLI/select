describe('The vendor provider service', function() {
    beforeEach(module('carli.vendorService'));

    it( 'should provide vendorService', inject( function(vendorService) {
        expect(vendorService).to.be.an('object');
    }));
});
