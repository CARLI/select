
describe('The One-time Purchases Selected-Products Controller', function(){

    var mockDependenciesForOneTimePurchase;

    beforeEach(function(){
        module('carli.sections.oneTimePurchases');
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

    it('should expose a list of Libraries and List Columns', inject(function($controller, $rootScope){
        var vm = $controller('oneTimePurchasesController', mockDependenciesForOneTimePurchase);
        $rootScope.$digest();
        expect(vm.libraryList).to.be.an('Array');
        expect(vm.libraryListColumns).to.be.an('Array');
    }));

});

