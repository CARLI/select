angular.module('carli.entityForms.license')
    .controller('editLicenseController', editLicenseController);

function editLicenseController( $scope, $rootScope, $location, cycleService, entityBaseService, licenseService, productService, vendorService, alertService ) {
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

    vm.statusOptions = entityBaseService.getStatusOptions();
    vm.offeringTypeOptions = licenseService.getOfferingTypeOptions();

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
        setLicenseFormPristine();
    }
    function initializeForExistingLicense() {
        licenseService.load(vm.licenseId).then( function( license ) {
            vm.license = license;
        } );
        watchCurrentCycle();
        vm.editable = false;
        vm.newLicense = false;
    }

    function watchCurrentCycle() {
        $scope.$watch(cycleService.getCurrentCycle, function (newValue) {
            if (newValue) {
                getProducts();
            }
        });
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        vm.editable = false;
        activate();
        setLicenseFormPristine();
    }

    function setLicenseFormPristine() {
        if ($scope.licenseForm) {
            $scope.licenseForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.licenseForm) {
            $rootScope.forms.licenseForm.$setPristine();
        }
    }

    function saveLicense(){
        if ( vm.licenseId !== undefined ){
            licenseService.update( vm.license )
                .then(function(){
                    alertService.putAlert('License updated', {severity: 'success'});
                    setLicenseFormPristine();
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

