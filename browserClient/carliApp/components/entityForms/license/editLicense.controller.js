angular.module('carli.entityForms.license')
    .controller('editLicenseController', editLicenseController);

function editLicenseController( $scope, $rootScope, $location, alertService, cycleService, entityBaseService, licenseService, productService, vendorService ) {
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
    vm.getProductDisplayName = productService.getProductDisplayName;

    vendorService.list().then( function( vendorList ){
        vm.vendorList = vendorList;
    });

    vm.statusOptions = entityBaseService.getStatusOptions();
    vm.offeringTypeOptions = licenseService.getOfferingTypeOptions();

    setupModalClosingUnsavedChangesWarning();
    activate();

    function activate() {
        if (vm.licenseId === undefined) {
            initializeForNewLicense();
        }
        else {
            initializeForExistingLicense();
        }
        vm.isModal = vm.newLicense;
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
            vm.license = angular.copy(license);
            setLicenseFormPristine();
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
        if ( vm.isModal ){
            return;
        }
        else {
            resetLicenseForm();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#new-license-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetLicenseForm() {
        activate();
    }

    function hideNewLicenseModal() {
        $('#new-license-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( licenseFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetLicenseForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function licenseFormIsDirty(){
        if ($scope.licenseForm) {
            return $scope.licenseForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.licenseForm) {
            return $rootScope.forms.licenseForm.$dirty;
        }
        return false;
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
                    resetLicenseForm();
                    hideNewLicenseModal();
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
                    resetLicenseForm();
                    hideNewLicenseModal();
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

