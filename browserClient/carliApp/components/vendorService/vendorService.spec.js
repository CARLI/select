describe('The Vendor Service', function() {
    beforeEach(module('carli.vendorService'));

    it( 'should provide vendorService', inject( function(vendorService) {
        expect(vendorService).to.be.an('object');
    }));

    it( 'should provide a list method', inject( function(vendorService) {
        expect(vendorService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(vendorService) {
        expect(vendorService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(vendorService) {
        expect(vendorService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(vendorService) {
        expect(vendorService.load).to.be.a('Function');
    }));
});
