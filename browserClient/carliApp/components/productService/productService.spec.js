describe('The product provider service', function() {
    beforeEach(module('carli.productService'));

    it('should provide productService', inject(function(productService) {
        expect(productService).to.be.an('object');
    }));

    it('productService.getProductList should return an array', inject(function(productService) {
        var products = productService.getProductList();
        expect(products).to.be.an('array');
        expect(products).to.not.be.empty();
        return products;
    }));

    it('productService.getProduct should return an object', inject(function(productService) {
        var product = productService.getProduct(0);
        expect(product).to.be.an('object');
        expect(product).to.have.property('id');
        return product;
    }));
});
