angular.module('carli.sections.oneTimePurchases.selectedProducts')
    .controller('selectedProductsController', selectedProductsController);

function selectedProductsController($routeParams, libraryService, productService) {
    var vm = this;
    vm.libraryId = $routeParams.libraryId;

    vm.filterState = 'all';

    vm.filter = function( value ){
        console.log( value );
        return (
            value.cycleType === 'One-Time Purchase' &&
            value.isActive === true &&
            (vm.filterState === 'all' || value.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased)
        );
    };

    vm.setShowSelectedProducts = function () {
        vm.filterState = 'selected';
    };

    vm.setShowAllProducts = function() {
        vm.filterState = 'all';
    };

    activate();

    function activate(){
        libraryService.load(vm.libraryId).then( function( library ) {
            vm.library = library;
        } );

        productService.listOneTimePurchaseProducts().then( function(productList){
            vm.productList = productList;
        });
    }
}