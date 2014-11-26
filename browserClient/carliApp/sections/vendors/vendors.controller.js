angular.module('carli.sections.vendors')
.controller('vendorsController', vendorController);

function vendorController( $sce, vendorService ){
    var vm = this;
    vm.afterVendorSubmit = populateVendorList;
    activate();

    function activate() {
        populateVendorList();
    }

    function populateVendorList() {
        vendorService.list().then( function(vendorList){
            vm.vendorList = vendorList;
        });
    }

    vm.vendorListColumns = [
        {
            label: "Vendor Name",
            contentFunction: function(vendor) {
                return $sce.trustAsHtml('<a href="vendor/' + vendor.id + '">' + vendor.name + '</a>');
            }
        },
        {
            label: "Vendor Website",
            contentFunction: function(vendor) { return vendor.websiteUrl; }
        },
        {
            label: "Comments",
            contentFunction: function(vendor) { return vendor.comments; }
        }
    ];
}

