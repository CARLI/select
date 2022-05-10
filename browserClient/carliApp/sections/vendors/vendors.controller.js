angular.module('carli.sections.vendors')
.controller('vendorsController', vendorController);

function vendorController( $sce, $filter, vendorService, userService ){
    var vm = this;
    vm.afterVendorSubmit = populateVendorList;
    vm.userIsReadOnly = userService.userIsReadOnly();
    activate();

    function activate() {
        populateVendorList();
    }

    function populateVendorList() {
        vm.loadingPromise = vendorService.list().then( function(vendorList){
            vm.vendorList = vendorList;
        });
    }

    vm.vendorListColumns = [
        {
            label: "Vendor Name",
            orderByProperty: 'name',
            contentFunction: function(vendor) {
                return $sce.trustAsHtml('<a href="vendor/' + vendor.id + '">' + vendor.name + '</a>');
            }
        },
        {
            label: "Vendor Website",
            orderByProperty: 'websiteUrl',
            contentFunction: function(vendor) {
                return $filter('linky')(vendor.websiteUrl, '_blank');
            }
        },
        {
            label: "Comments",
            orderByProperty: 'comments',
            contentFunction: function(vendor) { return vendor.comments; }
        }
    ];
}

