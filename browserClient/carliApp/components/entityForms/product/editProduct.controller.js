angular.module('carli.entityForms.product')
    .controller('editProductController', editProductController);

function editProductController( $scope, $filter, libraryService, licenseService, productService, vendorService, alertService ) {
    var vm = this;

    vm.productId = $scope.productId;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.saveProduct = saveProduct;

    vm.closeModal = function() {
        $('#new-product-modal').modal('hide');
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
        } );
        vm.editable = false;
        vm.newProduct = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        vm.editable = false;
        activate();
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
            return vendor.id === license.vendor;
        };
    }

    function refreshLicenseList() {
        if (vm.product && vm.product.vendor) {
            licenseService.list().then(function (licenseList) {
                vm.licenseList = $filter('filter')(licenseList, filterLicensesBelongingToVendor(vm.product.vendor));
                vm.noLicensesMessage = vm.licenseList.length > 0 ? '' : 'Selected vendor has no licenses';
            });
        } else {
            vm.noLicensesMessage = 'Please select a vendor first';
        }
    }
}
