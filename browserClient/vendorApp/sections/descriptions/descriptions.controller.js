angular.module('vendor.sections.descriptions')
.controller('descriptionsController', descriptionsController);

function descriptionsController( $scope, $rootScope, $q, cycleService, productService, userService, vendorStatusService ){
    var vm = this;

    vm.productChanged = productChanged;
    vm.noProductsHaveChanged = noProductsHaveChanged;
    vm.saveProducts = saveProducts;

    activate();


    function activate(){
        vm.vendorId = userService.getUser().vendor.id;

        setProductFormPristine();
        loadProducts();
    }

    function loadProducts(){
        vm.loadingPromise = productService.listActiveProductsForVendorId( userService.getUser().vendor.id )
            .then(function(productList){
                vm.products = productList;
            });
    }

    function setProductFormPristine() {
        vm.changedProducts = {};

        if ($scope.productForm) {
            $scope.productForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.productForm) {
            $rootScope.forms.productForm.$setPristine();
        }
    }

    function productChanged( productId ){
        vm.changedProducts[productId] = true;
    }

    function noProductsHaveChanged(){
        return Object.keys(vm.changedProducts).length === 0;
    }

    function listChangedProducts(){
        return vm.products.filter(function(product){
            return vm.changedProducts[product.id];
        });
    }

    function saveProducts(){
        var changedProducts = listChangedProducts();

        var cycle = cycleService.getCurrentCycle();
        var saveAllProducts = $q.all( changedProducts.map(saveProduct) );

        function saveProduct( product ){
            product.cycle = cycle;
            return productService.update(product);
        }

        return saveAllProducts
            .then(alertSuccess)
            .catch(alertError)
            .then(updateVendorStatus)
            .then(syncData)
            .catch(syncDataError);

        function alertSuccess(){
            console.log('saved '+changedProducts.length+' products');
            activate();
        }

        function alertError( err ){
            console.log( err );
        }

        function updateVendorStatus(){
            return vendorStatusService.updateVendorStatusActivity( 'Product Descriptions Updated', vm.vendorId, cycleService.getCurrentCycle() );
        }

        function syncData(){
            return cycleService.syncDataBackToCarli();
        }

        function syncDataError( err ){
            console.log( 'error syncing data',err );
        }
    }
}
