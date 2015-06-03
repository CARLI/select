angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $q, $scope, $rootScope, $filter, alertService, entityBaseService, errorHandler, cycleService, libraryService, licenseService, offeringService, productService, vendorService) {
    var vm = this;
    var otpFieldsCopy = [];
    var termFieldsCopy = {};
    var originalProductName = null;

    var templates = {
        productFields: 'carliApp/components/entityForms/product/editProduct.html',
        oneTimePurchaseFields: 'carliApp/components/entityForms/product/editOneTimePurchase.html'
    };
    vm.currentTemplate = templates.productFields;

    vm.productId = $scope.productId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.activeCycles = [];
    vm.productOfferings = [];
    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.cancelOtpEdit = revertOtpFields;
    vm.rememberOtpFields = rememberOtpFields;
    vm.cancelTermsEdit = revertTermFields;
    vm.rememberTermFields = rememberTermFields;
    vm.saveProduct = saveProduct;
    vm.submitAction = submitAction;
    vm.submitLabel = submitLabel;
    vm.productLicenseIsValid = productLicenseIsValid;
    vm.getProductDisplayName = productService.getProductDisplayName;

    vm.shouldShowOtpEditLink = function() {
        return vm.editable && !vm.newProduct && isOneTimePurchaseProduct(vm.product);
    };

    vm.shouldShowTermsEditLink = function() {
        return vm.editable && !vm.newProduct;
    };

    vendorService.list().then( function( vendorList ){
       vm.vendorList = vendorList;
    });

    refreshLicenseList();
    $scope.$watch('vm.product.vendor', refreshLicenseList);

    vm.statusOptions = entityBaseService.getStatusOptions();

    vm.productDetailCodeOptions = productService.getProductDetailCodeOptions();

    var initializeCyclesPromise = initializeCycles();

    setupModalClosingUnsavedChangesWarning();
    activate();

    function activate() {
        vm.isModal = vm.newProduct;

        if ($scope.productId === undefined) {
            return initializeForNewProduct();
        }
        else {
            return initializeCyclesPromise.then(initializeForExistingProduct);
        }
    }

    function initializeForNewProduct() {
        vm.editable = true;
        vm.newProduct = true;

        vm.product = {
            type: 'Product',
            cycle: cycleService.getCurrentCycle() || { cycleType: '' },
            isActive: true,
            contacts: []
        };

        vm.productOfferings = [];

        setProductFormPristine();

        return ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries();
    }

    function initializeForExistingProduct() {
        vm.editable = false;
        vm.newProduct = false;

        return productService.load($scope.productId).then( function( product ) {
            vm.product = angular.copy(product);
            copyFullCycleInstanceToProduct(vm.product);
            initializeProductNameWatcher();
            rememberOtpFields();
            rememberTermFields();

            setProductFormPristine();

            if ( isOneTimePurchaseProduct(product) ){
                return loadOfferingsForProduct(product)
                    .then(ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries);

            }
            else {
                return $q.when();
            }
        } );
    }

    function copyFullCycleInstanceToProduct(product) {
        vm.activeCycles.forEach(function (cycle) {
            if (product.cycle.id === cycle.id) {
                product.cycle = cycle;
            }
        });
    }

    function initializeProductNameWatcher() {
        originalProductName = vm.product.name;
        if (vm.product.previousName) {
            vm.shouldShowPreviousNameOption = true;
        }
        $scope.$watch('vm.product.name', function (newName, oldName) {
            if (oldName && oldName != newName) {
                vm.shouldShowPreviousNameOption = true;
            }
        });
    }
    function revertOtpFields() {
        angular.copy(otpFieldsCopy, vm.productOfferings);
    }
    function rememberOtpFields() {
        angular.copy(vm.productOfferings, otpFieldsCopy);
    }
    function revertTermFields() {
        vm.product.terms = angular.copy(termFieldsCopy, {});
    }
    function rememberTermFields() {
        angular.copy(vm.product.terms, termFieldsCopy);
    }
    function isOneTimePurchaseProduct(product){
        return product.cycle.cycleType === 'One-Time Purchase';
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        if ( vm.isModal ){
            return;
        }
        else {
            resetProductForm();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#new-product-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetProductForm() {
        return activate();
    }

    function hideProductModal() {
        $('#new-product-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( productFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetProductForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function productFormIsDirty(){
        if ($scope.productForm) {
            return $scope.productForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.productForm) {
            return $rootScope.forms.productForm.$dirty;
        }
        return false;
    }

    function setProductFormPristine() {
        vm.currentTemplate = templates.productFields;
        
        if ($scope.productForm) {
            $scope.productForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.productForm) {
            $rootScope.forms.productForm.$setPristine();
        }

        if ($scope.oneTimePurchasePricingForm) {
            $scope.oneTimePurchasePricingForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.oneTimePurchasePricingForm) {
            $rootScope.forms.oneTimePurchasePricingForm.$setPristine();
        }
    }

    function initializeCycles(){
        var loadCyclesPromise = cycleService.listActiveCycles().then(function(activeCycles) {
            vm.activeCycles = activeCycles;
        });

        watchCurrentCycle();
        return loadCyclesPromise;

        function watchCurrentCycle() {
            $scope.$watch(cycleService.getCurrentCycle, function (activeCycle) {
                if (activeCycle) {
                    activate();
                }
            });
        }
    }

    function loadOfferingsForProduct( product ){
        return offeringService.listOfferingsForProductId(product.id).then(function(offerings){
            vm.productOfferings = offerings;
            return offerings;
        });
    }

    function isWizardComplete() {
        if ( !isOneTimePurchaseProduct(vm.product)) {
            return true;
        }
        if (vm.currentTemplate == templates.oneTimePurchaseFields) {
            return true;
        }
        return false;
    }

    function submitAction() {
        if (!vm.newProduct || isWizardComplete()) {
            return saveProduct();
        } else {
            return ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries().then(function(){
                vm.currentTemplate = templates.oneTimePurchaseFields;
            });
        }
    }

    function submitLabel() {
        if (!vm.newProduct || isWizardComplete()) {
            return 'Save';
        }
        return 'Next';
    }

    function saveProduct(){
        translateOptionalSelections();

        var savePromise = $q.when();

        if (vm.productId === undefined) {
            savePromise = saveNewProduct();
        } else {
            savePreviousName();
            savePromise = saveExistingProduct();
        }

        return savePromise
            .then(syncData);

        function syncData(){
            return cycleService.syncDataToVendorDatabase( vm.product.vendor.id, vm.product.cycle );
        }
    }

    function translateOptionalSelections() {
        if (vm.product.license === undefined) {
            vm.product.license = null;
        }
    }

    function savePreviousName() {
        if (originalProductName !== vm.product.name) {
            vm.product.previousName = originalProductName;
        }
    }

    function saveExistingProduct() {
        return productService.update(vm.product)
            .then(updateOfferingsForExistingProduct)
            .then(function () {
                alertService.putAlert('Product updated', {severity: 'success'});
                resetProductForm().then(function(){
                    hideProductModal();
                    afterSubmitCallback();
                });
            })
            .catch(errorHandler);
    }

    function saveNewProduct() {
        return productService.create(vm.product)
            .then(saveOfferingsForNewProduct)
            .then(function (offeringsIds) {
                alertService.putAlert('Product added', {severity: 'success'});

                return resetProductForm().then(function(){
                    hideProductModal();
                    afterSubmitCallback();
                });
            })
            .catch(errorHandler);
    }

    function updateOfferingsForExistingProduct(){
        var savePromises = [];

        if ( vm.productOfferings ){
            vm.productOfferings.forEach(function(offering){
                if ( offering.id ){
                    savePromises.push( offeringService.update(offering) );
                }
                else {
                    offering.library = offering.library.id.toString();
                    savePromises.push( offeringService.create(offering) );
                }
            });
        }

        return $q.all( savePromises );
    }

    function saveOfferingsForNewProduct( productId ){
        var savePromises = [];
        if ( vm.productOfferings.length ){
            vm.productOfferings.forEach(function(partialOffering){
                savePromises.push( createNewOffering(partialOffering) );
            });
        }
        else {
            savePromises = offeringService.ensureProductHasOfferingsForAllLibraries( vm.product );
        }

        return $q.all( savePromises );

        function createNewOffering( partialOffering ){
            var newOffering = angular.copy(partialOffering);
            newOffering.product = productId;
            newOffering.library = partialOffering.library.id.toString();
            delete newOffering.$$hashKey;

            return offeringService.create(newOffering);
        }
    }

    function ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries(){
        if ( isOneTimePurchaseProduct(vm.product) ){
            return libraryService.listActiveLibraries().then(ensureProductHasOfferingForEachLibrary);
        }
        else {
            return $q.when();
        }

        function ensureProductHasOfferingForEachLibrary( libraryList ){
            return libraryList.map(ensureProductHasOfferingForLibrary);
        }

        function ensureProductHasOfferingForLibrary( library ){
            if ( productDoesNotHaveOfferingForLibrary(library) ){
                vm.productOfferings.push( createEmptyOffering(library) );
            }

            function productDoesNotHaveOfferingForLibrary(library){
                return vm.productOfferings.filter(function(offering){
                    return offering.library.id == library.id;
                }).length === 0;
            }
        }

        function createEmptyOffering( library ){
            var newOffering = {
                type: 'Offering',
                cycle: vm.product.cycle,
                library: library,
                pricing: {}
            };

            if ( vm.product.id ){
                newOffering.product = vm.product;
            }

            return newOffering;
        }
    }

    function filterLicensesBelongingToVendor(vendor) {
        return function(license) {
            return vendor.id === license.vendor.id;
        };
    }

    function refreshLicenseList() {
        if (vm.product && vm.product.vendor) {
            licenseService.list().then(function (licenseList) {
                vm.licenseList = $filter('filter')(licenseList, filterLicensesBelongingToVendor(vm.product.vendor));
                vm.noLicensesMessage = vm.licenseList.length > 0 ? '' : 'No license agreements for vendor';
            });
        } else {
            vm.noLicensesMessage = 'Please select a vendor first';
        }
    }

    function productLicenseIsValid(){
        return vm.product && vm.product.license && typeof vm.product.license === 'object';
    }
}
