
describe('The One-time Purchases Selected-Products Controller', function(){

    var vm, mockDependenciesForOneTimePurchase;

    beforeEach(function(){
        module('carli.sections.oneTimePurchases.selectedProducts');
        module('carli.mockServices');

        var mockOfferingList = [
            {
                type: 'Offering',
                product: {
                    vendor: ''
                },
                cycle: {
                    cycleType: 'One-Time Purchase'
                },
                pricing: {
                    site: 100
                }
            },
            {
                type: 'Offering',
                product: {
                    vendor: ''
                },
                cycle: {
                    cycleType: 'One-Time Purchase'
                },
                pricing: {
                    site: 100
                },
                selection: {
                    price: 100,
                    datePurchased: '2015-01-01'
                }
            },
            {
                type: 'Offering',
                product: {
                    vendor: ''
                },
                cycle: {
                    cycleType: 'One-Time Purchase'
                },
                pricing: {
                    site: 100
                },
                selection: {
                    price: 100,
                    datePurchased: '2015-01-01'
                }
            }
        ];

        var mockLibraryList = [
            {
                type: 'Library',
                id: 'testLibraryId',
                name: 'testLibrary'
            }
        ];

        inject(function ($controller, $rootScope, $q, mockAlertService, mockCycleService, mockLibraryService, mockOfferingService, mockVendorService) {
            mockLibraryService.setTestData(mockLibraryList);
            mockOfferingService.setTestData(mockOfferingList);
            
            mockDependenciesForOneTimePurchase = {
                $scope: {},
                $routeParams: {
                    libraryId: 'testLibraryId'
                },
                alertService: mockAlertService,
                cycleService: mockCycleService,
                libraryService: mockLibraryService,
                offeringService: mockOfferingService,
                vendorService: mockVendorService
            };

            vm = $controller('selectedProductsController', mockDependenciesForOneTimePurchase);
            $rootScope.$digest();
        });
    });

    it('should expose VM variables', function(){
        expect(vm.libraryId).to.be.a('String');
        expect(vm.offeringList).to.be.an('Array');
        expect(vm.filterState).to.be.a('String');
        expect(vm.selectedOfferings).to.be.an('Object');
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

        // There are 3 one-time purchase products offerings in the list
        var filteredList = vm.offeringList.filter( vm.filter );
        expect(filteredList.length).to.equal(3);

        // There are 2 that have been purchased
        vm.setShowPurchasedProducts();
        expect(vm.filterState).to.equal('purchased');
        filteredList = vm.offeringList.filter( vm.filter );
        expect(filteredList.length).to.equal(2);

        // There is 1 that has not been purchased
        vm.setShowNotPurchasedProducts();
        expect(vm.filterState).to.equal('not-purchased');
        filteredList = vm.offeringList.filter( vm.filter );
        expect(filteredList.length).to.equal(1);

        // verify the resetting makes it go back to 3
        vm.setShowAllProducts();
        expect(vm.filterState).to.equal('all');
        filteredList = vm.offeringList.filter( vm.filter );
        expect(filteredList.length).to.equal(3);
    });



    it('should call offeringService.update when purchasing a Product', function(){
        var mockOffering = vm.offeringList[2];

        expect( mockDependenciesForOneTimePurchase.offeringService.createOrUpdate ).to.equal('neither');
        vm.purchaseProduct( mockOffering );
        expect( mockDependenciesForOneTimePurchase.offeringService.createOrUpdate ).to.equal('update');
        expect( mockOffering.selection.datePurchased).to.be.a('String');
    });

    it('should call offeringService.update when canceling a purchasing', function(){
        var mockOffering = vm.offeringList[2];

        expect( mockDependenciesForOneTimePurchase.offeringService.createOrUpdate ).to.equal('neither');
        vm.cancelPurchase( mockOffering );
        expect( mockDependenciesForOneTimePurchase.offeringService.createOrUpdate ).to.equal('update');
        expect( mockOffering.selection).to.be.an('undefined');
    });

    it('should return the total price from computeTotalPurchasesAmount', function(){
        var total = vm.computeTotalPurchasesAmount();
        expect(total).to.equal(200);
    });
});

