angular.module('carli.sections.licenses')
.controller('licensesController', licenseController);

function licenseController( $sce, licenseService ){
    var vm = this;
    activate();

    function activate() {
        vm.licenseList = licenseService.list();
    }

    vm.licenseListColumns = [
        {
            label: "License Name",
            contentFunction: function(license) {
                return $sce.trustAsHtml('<a href="license/' + license.id + '">' + license.name + '</a>');
            }
        },
        {
            label: "License Website",
            contentFunction: function(license) { return license.websiteUrl; }
        },
        {
            label: "Comments",
            contentFunction: function(license) { return license.comments; }
        }
    ];
}

