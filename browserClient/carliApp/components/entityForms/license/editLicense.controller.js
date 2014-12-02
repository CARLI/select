angular.module('carli.entityForms.license')
    .controller('editLicenseController', editLicenseController);

function editLicenseController( $scope, licenseService, alertService ) {
    var vm = this;

    vm.licenseId = $scope.licenseId;
    console.log(vm.licenseId);
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.toggleEditable = toggleEditable;
    vm.saveLicense = saveLicense;
    vm.closeModal = function() {
        $('#new-license-modal').modal('hide');
    };

    vm.termOptions = [
        "Yes",
        "No",
        "Other"
    ];

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
                    afterSubmitCallback();
                })
                .catch(function(error) {
                    alertService.putAlert(error, {severity: 'danger'});
                });
        }
    }
}

