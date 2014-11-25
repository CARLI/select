angular.module('carli.sections.oneTimePurchases.selectedProducts')
    .controller('selectedProductsController', selectedProductsController);

function selectedProductsController($routeParams, libraryService, productService) {
    var vm = this;
    vm.libraryId = $routeParams.libraryId;
    vm.productList = [];
    vm.filterState = 'all';
    vm.selectedProducts = {};

    vm.filter = filter;
    vm.setShowPurchasedProducts = setShowPurchasedProducts;
    vm.setShowNotPurchasedProducts = setShowNotPurchasedProducts;
    vm.setShowAllProducts = setShowAllProducts;
    vm.purchaseProduct = purchaseProduct;
    vm.cancelPurchase = cancelPurchase;
    vm.computeTotalPurchasesAmount = computeTotalPurchasesAmount;
    vm.invoiceProducts = invoiceProducts;
    vm.reportProducts = reportProducts;

    activate();

    function activate(){
        libraryService.load(vm.libraryId).then( function( library ) {
            vm.library = library;
        } );

        productService.listOneTimePurchaseProducts().then( function(productList){
            vm.productList = productList;
        });
    }

    function filter( value ){
         return (
            value.cycleType === 'One-Time Purchase' &&
            value.isActive === true &&
            ((vm.filterState === 'all') ||
             (vm.filterState === 'purchased' && value.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased) ||
             (vm.filterState === 'not-purchased' && !value.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased))
        );
    }

    function setShowPurchasedProducts() {
        vm.filterState = 'purchased';
    }

    function setShowNotPurchasedProducts() {
        vm.filterState = 'not-purchased';
    }

    function setShowAllProducts() {
        vm.filterState = 'all';
    }

    function purchaseProduct(product) {
        product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = new Date().toJSON().slice(0,10);
        productService.update(product).then(function(){
            //TODO: add notification of success (inline?)
            //TODO: add audit trail entry (in service)
        })
        .catch(function(){
            //TODO: notification of failure (inline?)
            product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = null;
        });
    }

    function cancelPurchase(product) {
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
    }

    function computeTotalPurchasesAmount() {
        var totalAmount = 0;
        var product;

        for (var i=0; i<vm.productList.length; i++) {
            product = vm.productList[i];
            if (vm.filter(product) &&
                product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased) {
                totalAmount += product.oneTimePurchase.libraryPurchaseData[vm.libraryId].price;
            }
        }
        return totalAmount;
    }

    function invoiceProducts() {
        alert("Invoice Products:" + JSON.stringify(vm.selectedProducts));
    }

    function reportProducts() {
        alert("Report Products:" + JSON.stringify(vm.selectedProducts));
    }
}