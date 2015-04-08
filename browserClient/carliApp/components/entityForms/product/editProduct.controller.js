angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $q, $scope, $rootScope, $filter, entityBaseService, cycleService, libraryService, licenseService, offeringService, productService, vendorService, alertService ) {
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

    vm.closeModal = function closeModal() {
        $('#new-product-modal').modal('hide');
    };

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

    initializeCycles();

    activate();

    function activate() {
        if ($scope.productId === undefined) {
            initializeForNewProduct();
        }
        else {
            initializeForExistingProduct();
        }

        vm.isModal = vm.newProduct;
    }
    function initializeForNewProduct() {
        vm.product = {
            type: 'Product',
            cycle: cycleService.getCurrentCycle() || { cycleType: '' },
            isActive: true,
            contacts: []
        };

        ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries();

        vm.editable = true;
        vm.newProduct = true;
        setProductFormPristine();
    }
    function initializeForExistingProduct() {
        productService.load($scope.productId).then( function( product ) {
            vm.product = product;
            initializeProductNameWatcher();
            rememberOtpFields();
            rememberTermFields();

            setProductFormPristine();

            if ( isOneTimePurchaseProduct(product) ){
                loadOfferingsForProduct(product)
                    .then(ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries);

            }
        } );

        vm.editable = false;
        vm.newProduct = false;
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
        vm.editable = false;
        activate();
        setProductFormPristine();
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
        cycleService.listActiveCycles().then(function(activeCycles) {
            vm.activeCycles = activeCycles;
        });

        watchCurrentCycle();

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
            vm.currentTemplate = templates.oneTimePurchaseFields;
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

        if (vm.productId === undefined) {
            return saveNewProduct();
        } else {
            savePreviousName();
            return saveExistingProduct();
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
                vm.closeModal();
                alertService.putAlert('Product updated', {severity: 'success'});
                afterSubmitCallback();
                initializeForExistingProduct();
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }

    function saveNewProduct() {
        return productService.create(vm.product)
            .then(saveOfferingsForNewProduct)
            .then(function (offeringsIds) {
                vm.closeModal();
                alertService.putAlert('Product added', {severity: 'success'});
                afterSubmitCallback();
                initializeForNewProduct();
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }

    function updateOfferingsForExistingProduct(){
        var savePromises = [];

        if ( vm.productOfferings ){
            vm.productOfferings.forEach(function(offering){
                if ( offering.id ){
                    savePromises.push( offeringService.update(offering) );
                }
                else if ( offering.pricing.site ){
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
                var newOfferingPromise = createNewOffering(partialOffering);
                if ( newOfferingPromise ){
                    savePromises.push(newOfferingPromise);
                }
            });
        }
        else {
            savePromises = productService.createOfferingsForProduct( productId );
        }

        return $q.all( savePromises );

        function createNewOffering( partialOffering ){
            if ( partialOffering.pricing.site ){
                var newOffering = angular.copy( partialOffering );
                newOffering.product = productId;
                newOffering.library = partialOffering.library.id.toString();
                delete newOffering.$$hashKey;

                return offeringService.create(newOffering);
            }
        }
    }

    function ensureOneTimePurchaseProductHasEmptyOfferingsForAllLibraries(){
        var cycle = cycleService.getCurrentCycle();

        if ( isOneTimePurchaseProduct(vm.product) ){
            return  libraryService.list().then(ensureProductHasOfferingForEachLibrary);
        }

        function ensureProductHasOfferingForEachLibrary( libraryList ){
            libraryList.forEach(ensureProductHasOfferingForLibrary);
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
                cycle: cycle,
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
}
