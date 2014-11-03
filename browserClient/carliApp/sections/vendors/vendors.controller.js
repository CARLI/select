angular.module('carli.sections.vendors')
.controller('vendorsController', vendorController);

var testVendors = [
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"FOOBAR of New York","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"acme"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"type":"Vendor","name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"}
];

function vendorController( $sce, vendorService ){
    var vm = this;
    createTestVendors();
    activate();


    function activate() {
        vm.vendorList = vendorService.list();
    }

    function createTestVendors() {
        testVendors.forEach(function (v) {
            vendorService.create(v);
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

