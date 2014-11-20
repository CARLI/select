
describe('The One-time Purchases Selected-Products Controller', function(){

    var vm, mockDependenciesForOneTimePurchase;

    beforeEach(function(){
        module('carli.sections.oneTimePurchases.selectedProducts');
        module('carli.mockServices');

        inject(function ($controller, $rootScope, $q, mockLibraryService, mockProductService) {
            mockDependenciesForOneTimePurchase = {
                $routeParams: {
                    libraryId: 'testLibraryId'
                },
                libraryService: mockLibraryService,
                productService: mockProductService
            };

            vm = $controller('selectedProductsController', mockDependenciesForOneTimePurchase);
            $rootScope.$digest();
        });
    });

    it('should expose VM variables', function(){
        expect(vm.libraryId).to.be.a('String');
        expect(vm.productList).to.be.an('Array');
        expect(vm.filterState).to.be.a('String');
        expect(vm.selectedProducts).to.be.an('Object');
    });

    it('should expose VM functions', function(){
        expect(vm.filter).to.be.a('Function');
        expect(vm.setShowSelectedProducts).to.be.a('Function');
        expect(vm.setShowAllProducts).to.be.a('Function');
        expect(vm.purchaseProduct).to.be.a('Function');
        expect(vm.cancelPurchase).to.be.a('Function');
        expect(vm.computeTotalPurchasesAmount).to.be.a('Function');
        expect(vm.invoiceProducts).to.be.a('Function');
        expect(vm.reportProducts).to.be.a('Function');
    });

    it('should filter the list of Products', function(){
        var filteredList = vm.productList.filter( vm.filter );
        expect(filteredList.length).to.equal(2);
    });

    it('should toggle the filter state', function(){
        expect(vm.filterState).to.equal('all');

        vm.setShowSelectedProducts();
        expect(vm.filterState).to.equal('selected');

        vm.setShowAllProducts();
        expect(vm.filterState).to.equal('all');
    });

    it('should call productService.update when purchasing a Product', function(){
        var mockProduct = vm.productList[5];

        expect( mockDependenciesForOneTimePurchase.productService.createOrUpdate ).to.equal('neither');
        vm.purchaseProduct( mockProduct );
        expect( mockDependenciesForOneTimePurchase.productService.createOrUpdate ).to.equal('update');
        expect( mockProduct.oneTimePurchase.libraryPurchaseData[mockDependenciesForOneTimePurchase.$routeParams.libraryId].datePurchased).to.be.a('String');
    });

    it('should call productService.update when canceling a purchasing', function(){
        var mockProduct = vm.productList[5];

        expect( mockDependenciesForOneTimePurchase.productService.createOrUpdate ).to.equal('neither');
        vm.cancelPurchase( mockProduct );
        expect( mockDependenciesForOneTimePurchase.productService.createOrUpdate ).to.equal('update');
        expect( mockProduct.oneTimePurchase.libraryPurchaseData[mockDependenciesForOneTimePurchase.$routeParams.libraryId].datePurchased).to.be.a('null');
    });

    it('should return the total price from computeTotalPurchasesAmount', function(){
        var total = vm.computeTotalPurchasesAmount();
        expect(total).to.equal(200);
    });

    //TODO: invoiceProducts()
    //TODO: reportProducts()

});

