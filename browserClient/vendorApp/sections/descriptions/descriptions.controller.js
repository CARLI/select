angular.module('vendor.sections.descriptions')
.controller('descriptionsController', descriptionsController);

function descriptionsController( $scope, $rootScope, $q, activityLogService, alertService, cycleService, productService, userService, vendorDataService, vendorStatusService ){
    var vm = this;

    vm.maxLength = 1500;
    vm.productChanged = productChanged;
    vm.noProductsHaveChanged = noProductsHaveChanged;
    vm.formIsInvalid = formIsInvalid;
    vm.remainingCharacters = remainingCharacters;
    vm.saveProducts = saveProducts;
    vm.user = {};

    activate();

    function activate(){
        vm.cycle = cycleService.getCurrentCycle();
        vm.user = userService.getUser();
        vm.vendorId = vm.user.vendor.id;

        setProductFormPristine();
        loadProducts();
    }

    function loadProducts(){
        vm.loadingPromise = productService.listActiveProductsForVendorId( userService.getUser().vendor.id )
            .then(function(productList){
                productList.forEach(product => {
                    if(product.description === undefined)
                        product.description = '';
                    if(product.comments === undefined)
                        product.comments = '';
                });
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

    function formIsInvalid(){
        return $scope.productForm.$invalid || ($rootScope.forms && $rootScope.forms.productForm.$invalid);
    }

    function listChangedProducts(){
        return vm.products.filter(function(product){
            return vm.changedProducts[product.id];
        });
    }

    function remainingCharacters(product, property) {
        // ng-maxlength makes the model undefined when it exceeds the given length
        if (typeof product === 'undefined' || typeof product[property] === 'undefined' ){
            return 'limit exceeded';
        }

        return vm.maxLength - product[property].length;
    }

    function saveProducts(){
        var changedProducts = listChangedProducts();
        var cycle = cycleService.getCurrentCycle();

        return vendorDataService.isVendorAllowedToMakeChangesToCycle(vm.user, cycle)
            .then(function(vendorAllowedToSave){
                if ( vendorAllowedToSave ){
                    return saveAllProducts()
                        .then(alertSuccess)
                        .catch(alertError)
                        .then(updateVendorStatus)
                        .then(syncData)
                        .catch(syncDataError);
                }
                else {
                    alertService.putAlert('Pricing for the current cycle has been closed. Please contact CARLI staff for more information.', {severity: 'danger'});
                    return false;
                }
            });

        function saveAllProducts(){
            return $q.all( changedProducts.map(saveProduct) );

            function saveProduct( product ){
                product.cycle = cycle;
                return productService.update(product)
                    .then(function(id) {
                        return logDescriptionChangedForProduct(product);
                    });
            }
        }

        function alertSuccess(){
            Logger.log('saved '+changedProducts.length+' products');
            activate();
        }

        function alertError( err ){
            Logger.log( err );
        }

        function updateVendorStatus(){
            return vendorStatusService.updateVendorStatusActivity( 'Product Descriptions Updated', vm.vendorId, cycleService.getCurrentCycle() );
        }

        function logDescriptionChangedForProduct(product) {
            var cycle = vm.cycle;
            var vendor = vm.user.vendor;
            return activityLogService.logVendorChangeDescription(cycle, vendor, product);
        }

        function syncData(){
            return cycleService.syncDataBackToCarli();
        }

        function syncDataError( err ){
            Logger.log( 'error syncing data',err );
        }
    }
}
