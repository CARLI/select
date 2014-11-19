angular.module('carli.sections.oneTimePurchases.selectedProducts')
    .controller('selectedProductsController', selectedProductsController);

function selectedProductsController($routeParams, libraryService, productService) {
    var vm = this;
    vm.libraryId = $routeParams.libraryId;
    vm.productList = [];
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

    vm.computeTotalPurchasesAmount = function() {
        var totalAmount = 0;
        var product;

        for (i=0; i<vm.productList.length; i++) {
            product = vm.productList[i];
            if (vm.filter(product) &&
                product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased) {
                totalAmount += product.oneTimePurchase.libraryPurchaseData[vm.libraryId].price;
            }
        }
        return totalAmount;
    };

    vm.invoiceProducts = function() {
        alert("Invoice Products:" + JSON.stringify(vm.selectedProducts));
    };

    vm.reportProducts = function() {
        alert("Report Products:" + JSON.stringify(vm.selectedProducts));
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