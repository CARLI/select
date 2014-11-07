angular.module('carli.sections.licenses')
.controller('licensesController', licensesController);

function licensesController( $sce, licenseService ){
    var vm = this;
    activate();

    function activate() {
        vm.licenseList = licenseService.list();
    }

    vm.licenseListColumns = [
        {
            label: "License Agreement",
            contentFunction: function(license) {
                return $sce.trustAsHtml('<a href="license/' + license.id + '">' + license.name + '</a>');
            }
        },
        {
            label: "Vendor",
            contentFunction: function(license) { return license.vendor.name; }
        },
        {
            label: "Contract Number",
            contentFunction: function(license) { return license.contractNumber; }
        }
    ];
}

