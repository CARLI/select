
describe('The One-time Purchases Selected-Products Controller', function(){

    var vm, mockDependenciesForOneTimePurchase;

    beforeEach(function(){
        module('carli.sections.oneTimePurchases.selectedProducts');
        module('carli.mockServices');

        var mockProductList = [
            {
                type: 'Product',
                name: 'Test Product 0',
                cycleType: 'Fiscal Year',
                isActive: true
            },
            {
                type: 'Product',
                name: 'Test Product 1',
                cycleType: 'Calendar Year',
                isActive: true
            },
            {
                type: 'Product',
                name: 'Test Product 2',
                cycleType: 'Fiscal Year',
                isActive: false
            },
            {
                type: 'Product',
                name: 'Test Product 3',
                cycleType: 'Calendar Year',
                isActive: false
            },
            {
                type: 'Product',
                name: 'Test Product 4',
                cycleType: 'One-Time Purchase',
                isActive: true,
                oneTimePurchase: {
                    libraryPurchaseData: {
                        testLibraryId: {
                            datePurchased: '2015-01-01',
                            price: 100
                        }
                    }
                }
            },
            {
                type: 'Product',
                name: 'Test Product 5',
                cycleType: 'One-Time Purchase',
                isActive: true,
                oneTimePurchase: {
                    libraryPurchaseData: {
                        testLibraryId: {
                            datePurchased: '2015-01-01',
                            price: 100
                        }
                    }
                }
            },
            {
                type: 'Product',
                name: 'Test Product 6 Unpurchased',
                cycleType: 'One-Time Purchase',
                isActive: true,
                oneTimePurchase: {
                    libraryPurchaseData: {
                        testLibraryId: {
                        }
                    }
                }
            }
        ];

        inject(function ($controller, $rootScope, $q, mockLibraryService, mockProductService) {
            mockProductService.setTestData(mockProductList);
            
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
        expect(vm.setShowPurchasedProducts).to.be.a('Function');
        expect(vm.setShowNotPurchasedProducts).to.be.a('Function');
        expect(vm.setShowAllProducts).to.be.a('Function');
        expect(vm.purchaseProduct).to.be.a('Function');
        expect(vm.cancelPurchase).to.be.a('Function');
        expect(vm.computeTotalPurchasesAmount).to.be.a('Function');
        expect(vm.invoiceProducts).to.be.a('Function');
        expect(vm.reportProducts).to.be.a('Function');
    });

    it('should toggle the filter state', function(){
        expect(vm.filterState).to.equal('all');

        // There are 3 one-time purchase products in the list
        var filteredList = vm.productList.filter( vm.filter );
        expect(filteredList.length).to.equal(3);

        // There are 2 that have been purchased
        vm.setShowPurchasedProducts();
        expect(vm.filterState).to.equal('purchased');
        filteredList = vm.productList.filter( vm.filter );
        expect(filteredList.length).to.equal(2);

        // There is 1 that has not been purchased
        vm.setShowNotPurchasedProducts();
        expect(vm.filterState).to.equal('not-purchased');
        filteredList = vm.productList.filter( vm.filter );
        expect(filteredList.length).to.equal(1);

        // verify the resetting makes it go back to 3
        vm.setShowAllProducts();
        expect(vm.filterState).to.equal('all');
        filteredList = vm.productList.filter( vm.filter );
        expect(filteredList.length).to.equal(3);
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

