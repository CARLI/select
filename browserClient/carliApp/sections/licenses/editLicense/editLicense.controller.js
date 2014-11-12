angular.module('carli.sections.licenses.edit')
    .controller('editLicenseController', editLicenseController);

function editLicenseController( $location, $routeParams, licenseService, alertService ) {
    var vm = this;
    var licenseId = $routeParams.id;

    vm.toggleEditable = toggleEditable;
    vm.saveLicense = saveLicense;

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
        if (licenseId === 'new') {
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
        licenseService.load(licenseId).then( function( license ) {
            vm.license = license;
        } );

        vm.editable = false;
        vm.newLicense = false;
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function saveLicense(){
        if ( licenseId !== 'new' ){
            licenseService.update( vm.license ).then(function(){
                alertService.putAlert('License updated', {severity: 'success'});
                $location.path('/license');
            });
        }
        else {
            licenseService.create( vm.license ).then(function(){
                alertService.putAlert('License added', {severity: 'success'});
                $location.path('/license');
            });
        }
    }
}
