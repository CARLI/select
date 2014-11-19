angular.module('carli.sections.oneTimePurchases.selectedProducts')
    .controller('selectedProductsController', selectedProductsController);

function selectedProductsController($routeParams, libraryService, productService) {
    var vm = this;
    vm.libraryId = $routeParams.libraryId;

    vm.filterState = 'all';

    vm.filter = function( value ){
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

    vm.purchaseProduct = function(product) {
        product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = new Date().toJSON().slice(0,10);
        productService.update(product).then(function(){
            //TODO: add notification of success (inline?)
            //TODO: add audit trail entry (in service)
        })
        .catch(function(){
            //TODO: notification of failure (inline?)
            product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = null;
        });
    };

    vm.cancelPurchase = function(product) {
        var oldDate = product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased;

        product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = null;
        productService.update(product).then(function(){
            //TODO: add notification of success (inline?)
            //TODO: add audit trail entry (in service)
        })
        .catch(function(){
            //TODO: notification of failure (inline?)
            product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = oldDate;
        });
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