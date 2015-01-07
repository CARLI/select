describe('The Product service', function() {
    beforeEach(module('carli.productService'));

    it( 'should provide productService', inject( function(productService) {
        expect(productService).to.be.an('Object');
    }));

    it( 'should provide a list method', inject( function(productService) {
        expect(productService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(productService) {
        expect(productService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(productService) {
        expect(productService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(productService) {
        expect(productService.load).to.be.a('Function');
    }));

    it( 'should provide a listAvailableOneTimePurchaseProducts method', inject( function(productService) {
        expect(productService.listAvailableOneTimePurchaseProducts).to.be.a('Function');
    }));

    it( 'should provide a listProductsForVendorId method', inject( function(productService) {
        expect(productService.listProductsForVendorId).to.be.a('Function');
    }));

    it( 'should provide a getProductDetailCodeOptions method', inject( function(productService) {
        expect(productService.getProductDetailCodeOptions).to.be.a('Function');
        expect(productService.getProductDetailCodeOptions()).to.be.an('Array');
    }));
});
