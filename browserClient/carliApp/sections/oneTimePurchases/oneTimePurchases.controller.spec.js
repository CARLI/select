
describe('The One-time purchase Controller', function(){

    var mockDependenciesForOneTimePurchase;

    beforeEach(function(){
        module('carli.sections.oneTimePurchases');
        module('carli.mockServices');

        inject(function ($q, mockLibraryService) {
            mockDependenciesForOneTimePurchase = {
                libraryService: mockLibraryService
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

