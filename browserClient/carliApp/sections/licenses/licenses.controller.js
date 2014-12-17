angular.module('carli.sections.licenses')
.controller('licensesController', licensesController);

function licensesController( $sce, licenseService ){
    var vm = this;
    vm.afterLicenseSubmit = populateLicenseList;
    activate();

    function activate() {
        populateLicenseList();
    }

    function populateLicenseList() {
        licenseService.list().then( function(licenseList){
            vm.licenseList = licenseList;
        });
    }

    vm.licenseListColumns = [
        {
            label: "License Agreement",
            orderByProperty: 'name',
            contentFunction: function(license) {
                return $sce.trustAsHtml('<a href="license/' + license.id + '">' + license.name + '</a>');
            }
        },
        {
            label: "Vendor",
            orderByProperty: 'vendor.name',
            contentFunction: function(license) { return license.vendor.name; }
        },
        {
            label: "Contract Number",
            orderByProperty: 'contractNumber',
            contentFunction: function(license) { return license.contractNumber; }
        }
    ];
}

