describe('The vendor provider service', function() {
    beforeEach(module('carli.vendorService'));

    it('should provide vendorService', inject(function(vendorService) {
        expect(vendorService).to.be.an('object');
    }));

    it('should have a method called getVendors', inject(function(vendorService) {
        expect(vendorService.getVendors).to.be.a('function');
    }));

    it('vendorService.getVendors should return an array', inject(function(vendorService) {
        var vendors = vendorService.getVendors();
        expect(vendors).to.be.a('array');
    }));
});