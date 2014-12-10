angular.module('carli.sections.oneTimePurchases.selectedProducts')
    .controller('selectedProductsController', selectedProductsController);

function selectedProductsController($routeParams, libraryService, productService, alertService) {
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
        loadLibrary();
        loadProductList();
    }

    function loadLibrary() {
        libraryService.load(vm.libraryId).then(function (library) {
            vm.library = library;
        });
    }

    function loadProductList() {
        productService.listAvailableOneTimePurchaseProducts().then(function (productList) {
            vm.productList = productList;
        });
    }

    function filter( value ){
        var isProductPurchased = value.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased;

        filterValue =   (vm.filterState === 'all') ||
                        (vm.filterState === 'purchased' && isProductPurchased) ||
                        (vm.filterState === 'not-purchased' && !isProductPurchased);

        return filterValue;
    }

    function setShowPurchasedProducts() {
        vm.filterState = 'purchased';
        unselectHiddenProducts();
    }

    function setShowNotPurchasedProducts() {
        vm.filterState = 'not-purchased';
        unselectHiddenProducts();
    }

    function setShowAllProducts() {
        vm.filterState = 'all';
        unselectHiddenProducts();
    }

    function unselectHiddenProducts() {
        var key, product;
        for ( key in vm.productList ){
            product = vm.productList[key];
            if ( !filter(product) ){
                vm.selectedProducts[product.id] = false;
            }
        }
    }

    function purchaseProduct(product) {
        product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = new Date().toJSON().slice(0,10);
        productService.update(product).then(function(){
            alertService.putAlert(product.name + " purchased", {severity: 'success'});
            //TODO: add audit trail entry (in service)
        })
        .catch(function(error){
            alertService.putAlert(error, {severity: 'danger'});
            loadProductList();
        });
    }

    function cancelPurchase(product) {
        var oldDate = product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased;

        product.oneTimePurchase.libraryPurchaseData[vm.libraryId].datePurchased = null;
        productService.update(product).then(function(){
            alertService.putAlert(product.name + " purchase cancelled", {severity: 'success'});
            //TODO: add audit trail entry (in service)
        })
        .catch(function(error){
            alertService.putAlert(error, {severity: 'danger'});
            loadProductList();
        });
    }

    function computeTotalPurchasesAmount() {
        var totalAmount = 0;
        var product;

        for (var i=0; i<vm.productList.length; i++) {
            product = vm.productList[i];
            if (vm.filter(product) &&
                product.oneTimePurchase.libraryPurchaseData[vm.libraryId] &&
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
