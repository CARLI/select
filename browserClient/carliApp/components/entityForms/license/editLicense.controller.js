angular.module('carli.entityForms.license')
    .controller('editLicenseController', editLicenseController);

function editLicenseController( $scope, $location, licenseService, productService, vendorService, alertService ) {
    var vm = this;
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.licenseId = $scope.licenseId;
    vm.vendorList = [];
    vm.productList = [];

    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.saveLicense = saveLicense;
    vm.showProductsModal = showProductsModal;
    vm.closeProductsModalAndGoTo = closeProductsModalAndGoTo;
    vm.closeNewLicenseModal = function() {
        $('#new-license-modal').modal('hide');
    };

    vendorService.list().then( function( vendorList ){
        vm.vendorList = vendorList;
    });

    vm.statusOptions = [
        {
            label: 'Active',
            value: true
        },
        {
            label: 'Inactive',
            value: false
        }
    ];
    vm.offeringTypeOptions = [
        {
            label: 'Product',
            value: "'Product'"
        },
        {
            label: 'Service',
            value: "'Service'"
        }
    ];

    activate();

    function activate() {
        if (vm.licenseId === undefined) {
            initializeForNewLicense();
        }
        else {
            initializeForExistingLicense();
        }
    }
    function initializeForNewLicense() {
        vm.license = {
            type: 'License',
            isActive: true,
            offeringType: 'Product',
            contacts: []
        };
        vm.editable = true;
        vm.newLicense = true;
    }
    function initializeForExistingLicense() {
        licenseService.load(vm.licenseId).then( function( license ) {
            vm.license = license;
        } );
        vm.editable = false;
        vm.newLicense = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        vm.editable = false;
        activate();
    }

    function saveLicense(){
        if ( vm.licenseId !== undefined ){
            licenseService.update( vm.license )
                .then(function(){
                    alertService.putAlert('License updated', {severity: 'success'});
                    afterSubmitCallback();
                })
                .catch(function(error) {
                    alertService.putAlert(error, {severity: 'danger'});
                });
        }
        else {
            licenseService.create( vm.license )
                .then(function(){
                    alertService.putAlert('License added', {severity: 'success'});
                    initializeForNewLicense();
                    afterSubmitCallback();
                })
                .catch(function(error) {
                    alertService.putAlert(error, {severity: 'danger'});
                });
        }
    }

    function getProducts() {
        productService.listProductsForLicenseId(vm.licenseId).then ( function ( productList ) {
            vm.productList = productList;
        });
    }

    function showProductsModal() {
        getProducts();
        $('#products-modal').modal();
    }

    function closeProductsModalAndGoTo(path) {
        var $productsModal = $('#products-modal');
        $productsModal.modal('hide');
        $productsModal.on('hidden.bs.modal', function () {
            $scope.$apply(function() {
                $location.path(path);
            });
        });
    }
}

