angular.module('carli.sections.licenses')
.controller('licensesController', licensesController);

function licensesController( $filter, $sce, licenseService, userService ){
    var vm = this;
    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.afterLicenseSubmit = populateLicenseList;
    activate();

    function activate() {
        populateLicenseList();
    }

    function populateLicenseList() {
        vm.loadingPromise = licenseService.list().then( function(licenseList){
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
            orderByProperty: ['vendor.name','name'],
            contentFunction: function(license) { return license.vendor.name; }
        },
        {
            label: "Contract Number",
            orderByProperty: ['contractNumber','name'],
            contentFunction: function(license) { return license.contractNumber; }
        },
        {
            label: "Current Term Ends",
            orderByProperty: ['currentTermEndDate','name'],
            contentFunction: function(license) {
                var endDate = $filter('date')(license.currentTermEndDate, 'MM/dd/yyyy');
                var flag = '';

                if ( license.contractTermEndsSoon() ){
                    flag = '<span class="fa fa-clock-o"></span>';
                }

                return endDate + flag;
            }
        }
    ];
}

