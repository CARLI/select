describe('The vendor provider service', function() {
    beforeEach(module('carli.vendorService'));

    it('should provide vendorService', inject(function(vendorService) {
        expect(vendorService).to.be.an('object');
    }));

    it('vendorService.getVendorList should return an array', inject(function(vendorService) {
        var vendors = vendorService.getVendorList();
        expect(vendors).to.be.a('array');
        expect(vendors).to.not.be.empty();
    }));

    it('vendorService.getVendor(0) should return an object', inject(function(vendorService) {
        var vendor = vendorService.getVendor(0);
        expect(vendor).to.be.an('object');
        expect(vendor).to.have.property('id');
    }));
});
