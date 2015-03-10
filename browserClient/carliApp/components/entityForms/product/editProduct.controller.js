angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $q, $scope, $rootScope, $filter, entityBaseService, cycleService, licenseService, offeringService, productService, vendorService, alertService ) {
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

    activate();

    function activate() {
        if (vm.productId === undefined) {
            initializeForNewProduct();
        }
        else {
            initializeForExistingProduct();
        }
        vm.isModal = vm.newProduct;
        initializeCycles();
    }
    function initializeForNewProduct() {
        vm.product = {
            type: 'Product',
            cycle: cycleService.getCurrentCycle() || { cycleType: '' },
            isActive: true,
            contacts: []
        };
        vm.editable = true;
        vm.newProduct = true;
        setProductFormPristine();
    }
    function initializeForExistingProduct() {
        productService.load(vm.productId).then( function( product ) {
            vm.product = product;
            initializeProductNameWatcher();
            rememberOtpFields();
            rememberTermFields();

            if ( isOneTimePurchaseProduct(product) ){
                loadOfferingsForProduct(product);
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
                    console.log('new active cycle',activeCycle);
                    vm.product.cycle = activeCycle;
                }
            });
        }
    }

    function loadOfferingsForProduct( product ){
        offeringService.listOfferingsForProductId(product.id).then(function(offerings){
            vm.productOfferings = offerings;
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
            saveProduct();
            vm.closeModal();
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
            saveNewProduct();
        } else {
            savePreviousName();
            saveExistingProduct();
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
        productService.update(vm.product)
            .then(saveOfferings)
            .then(function () {
                alertService.putAlert('Product updated', {severity: 'success'});
                setProductFormPristine();
                toggleEditable();
                afterSubmitCallback();
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }

    function saveNewProduct() {
        productService.create(vm.product)
            .then(function () {
                alertService.putAlert('Product added', {severity: 'success'});
                initializeForNewProduct();
                afterSubmitCallback();
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }

    function saveOfferings(){
        var savePromises = [];

        if ( vm.productOfferings ){
            vm.productOfferings.forEach(function(offering){
                savePromises.push( offeringService.update(offering) );
            });
        }

        return $q.all( savePromises );
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
