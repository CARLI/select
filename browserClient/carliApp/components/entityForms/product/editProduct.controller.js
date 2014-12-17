angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $scope, $filter, libraryService, licenseService, productService, vendorService, alertService ) {
    var vm = this;
    var otpFieldsCopy = {};

    var templates = {
        productFields: 'carliApp/components/entityForms/product/editProduct.html',
        oneTimePurchaseFields: 'carliApp/components/entityForms/product/editOneTimePurchase.html'
    };
    vm.currentTemplate = templates.productFields;

    vm.productId = $scope.productId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.cancelOtpEdit = revertOtpFields;
    vm.rememberOtpFields = rememberOtpFields;
    vm.saveProduct = saveProduct;
    vm.submitAction = submitAction;
    vm.submitLabel = submitLabel;

    vm.closeModal = function closeModal() {
        $('#new-product-modal').modal('hide');
    };

    vm.shouldShowOtpEditLink = function() {
        return vm.editable && vm.product.cycleType == 'One-Time Purchase' && !vm.newProduct;
    };

    libraryService.list().then( function( libraryList ){
        vm.libraryList = libraryList;
    });

    vendorService.list().then( function( vendorList ){
       vm.vendorList = vendorList;
    });

    refreshLicenseList();
    $scope.$watch('vm.product.vendor', refreshLicenseList);

    //TODO: Move to someplace common since it's on Product, Library, and Product now
    vm.statusOptions = [
        {
            label: 'Active Product',
            value: true
        },
        {
            label: 'Inactive Product',
            value: false
        }
    ];

    //TODO: Move this someplace more common than here (Cycle Service?)
    vm.cycleOptions = [
        "Fiscal Year",
        "Calendar Year",
        "One-Time Purchase",
        "Alternative Cycle"
    ];

    vm.productDetailCodeOptions = [
        "USIA - Membership",
        "USIB - Database",
        "USIE - Misc.",
        "USIF - I-Share",
        "USIG - Chronicle of Higher Education",
        "USIH - OED",
        "USII - Spring Database",
        "USIJ - Fall Database",
        "USIK - SFX",
        "USIL - SFX",
        "USIM - I-Share Pre-Pay",
        "USIN - Database Pre-Pay"
    ];

    vm.termTypes = [
        "Download",
        "ILL",
        "Course Packs",
        "Print",
        "Limited Sharing for Scholarly Purposes",
        "Use by Walk-ins",
        "E-Reserves"
    ];

    vm.termOptions = [
        "Yes",
        "No",
        "Other"
    ];

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
        vm.product = {
            type: 'Product',
            isActive: true,
            contacts: [],
            libraryPrices: {}
        };
        vm.editable = true;
        vm.newProduct = true;
    }
    function initializeForExistingProduct() {
        productService.load(vm.productId).then( function( product ) {
            vm.product = product;
            rememberOtpFields();
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

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        vm.editable = false;
        activate();
    }

    function isWizardComplete() {
        if (vm.product.cycleType != 'One-Time Purchase') {
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
                afterSubmitCallback();
                initializeForNewProduct();
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
