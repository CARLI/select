angular.module('vendor.sections.descriptions')
.controller('descriptionsController', descriptionsController);

function descriptionsController( $scope, $rootScope, $q, cycleService, productService, userService ){
    var vm = this;

    vm.productChanged = productChanged;
    vm.noProductsHaveChanged = noProductsHaveChanged;
    vm.saveProducts = saveProducts;

    activate();


    function activate(){
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
        console.time('saveProducts', changedProducts);

        var cycle = cycleService.getCurrentCycle();
        var saveAllProducts = $q.all( changedProducts.map(saveProduct) );

        function saveProduct( product ){
            product.cycle = cycle;
            return productService.update(product);
        }

        return saveAllProducts
            .then(alertSuccess)
            .catch(alertError);

        function alertSuccess(){
            console.timeEnd('saveProducts');
            console.log('saved '+changedProducts.length+' products');
            activate();
        }

        function alertError( err ){
            console.log( err );
        }
    }
}
