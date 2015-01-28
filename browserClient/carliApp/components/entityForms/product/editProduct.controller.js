angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $scope, $rootScope, $filter, entityBaseService, cycleService, libraryService, licenseService, productService, vendorService, alertService ) {
    var vm = this;
    var otpFieldsCopy = {};
    var termFieldsCopy = {};

    var templates = {
        productFields: 'carliApp/components/entityForms/product/editProduct.html',
        oneTimePurchaseFields: 'carliApp/components/entityForms/product/editOneTimePurchase.html'
    };
    vm.currentTemplate = templates.productFields;

    vm.productId = $scope.productId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.activeCycles = [];
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
        return vm.editable && vm.product.cycle.cycleType == 'One-Time Purchase' && !vm.newProduct;
    };

    vm.shouldShowTermsEditLink = function() {
        return vm.editable && !vm.newProduct;
    };

    cycleService.listActiveCycles().then(function(activeCycles) {
        vm.activeCycles = activeCycles;
    });

    libraryService.list().then( function( libraryList ){
        vm.libraryList = libraryList;
    });

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
    }
    function initializeForNewProduct() {
        console.log('current cycle: ',cycleService.getCurrentCycle());

        vm.product = {
            type: 'Product',
            cycle: cycleService.getCurrentCycle() || { cycleType: '' },
            isActive: true,
            contacts: [],
            libraryPrices: {}
        };
        vm.editable = true;
        vm.newProduct = true;
        setProductFormPristine();
    }
    function initializeForExistingProduct() {
        productService.load(vm.productId).then( function( product ) {
            vm.product = product;
            rememberOtpFields();
            rememberTermFields();
        } );
        vm.editable = false;
        vm.newProduct = false;
    }
    function revertOtpFields() {
        angular.copy(otpFieldsCopy, vm.product.oneTimePurchase);
    }
    function rememberOtpFields() {
        angular.copy(vm.product.oneTimePurchase, otpFieldsCopy);
    }
    function revertTermFields() {
        vm.product.terms = angular.copy(termFieldsCopy, {});
    }
    function rememberTermFields() {
        angular.copy(vm.product.terms, termFieldsCopy);
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
        if ($scope.productForm) {
            $scope.productForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.productForm) {
            $rootScope.forms.productForm.$setPristine();
        }
    }

    function isWizardComplete() {
        if (vm.product.cycle.cycleType != 'One-Time Purchase') {
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
            saveExistingProduct();
        }
    }

    function translateOptionalSelections() {
        if (vm.product.license === undefined) {
            vm.product.license = null;
        }
    }

    function saveExistingProduct() {
        productService.update(vm.product)
            .then(function () {
                alertService.putAlert('Product updated', {severity: 'success'});
                setProductFormPristine();
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
