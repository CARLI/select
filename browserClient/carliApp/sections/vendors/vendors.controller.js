angular.module('carli.sections.vendors')
.controller('vendorsController', vendorController);

function vendorController( $sce, vendorService ){
    var vm = this;
    vm.afterVendorSubmit = afterVendorSubmit;
    activate();

    function activate() {
        vendorService.list().then( function(vendorList){
            vm.vendorList = vendorList;
        });
    }

    function afterVendorSubmit() {
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

