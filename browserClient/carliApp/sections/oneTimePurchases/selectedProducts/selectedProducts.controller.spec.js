
describe('The One-time Purchases Selected-Products Controller', function(){

    var mockDependenciesForOneTimePurchase;

    beforeEach(function(){
        module('carli.sections.oneTimePurchases.selectedProducts');
        module('carli.mockServices');

        inject(function ($q, mockLibraryService, mockProductService) {
            mockDependenciesForOneTimePurchase = {
                $routeParams: {
                    libraryId: 'xxxxxxxxxx'
                },
                libraryService: mockLibraryService,
                productService: mockProductService
            };
        });
    });

    it('should expose VM variables', inject(function($controller, $rootScope){
        var vm = $controller('selectedProductsController', mockDependenciesForOneTimePurchase);
        $rootScope.$digest();

        expect(vm.libraryId).to.be.a('String');
        expect(vm.productList).to.be.an('Array');
        expect(vm.filterState).to.equal('all');
        expect(vm.selectedProducts).to.be.an('Object');
    }));

    it('should expose VM functions', inject(function($controller, $rootScope){
        var vm = $controller('selectedProductsController', mockDependenciesForOneTimePurchase);
        $rootScope.$digest();

        expect(vm.filter).to.be.a('Function');
        expect(vm.setShowSelectedProducts).to.be.a('Function');
        expect(vm.setShowAllProducts).to.be.a('Function');
        expect(vm.purchaseProduct).to.be.a('Function');
        expect(vm.cancelPurchase).to.be.a('Function');
        expect(vm.computeTotalPurchasesAmount).to.be.a('Function');
        expect(vm.invoiceProducts).to.be.a('Function');
        expect(vm.reportProducts).to.be.a('Function');
    }));

});

