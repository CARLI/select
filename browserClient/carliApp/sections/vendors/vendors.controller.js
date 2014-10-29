angular.module('carli.sections.vendors')
.controller('vendorsController', vendorController);

var testVendors = [
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"FOOBAR Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"acme"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"},
    {"name":"ACME Publishing","contacts":[],"websiteUrl":"http://www.acme.com","isActive":true,"comments":"foobar"}
];

function vendorController( vendorService ){
    var vm = this;
    createTestVendors();
    activate();


    function activate() {
        vm.vendorList = vendorService.list();
        vm.activeFilterState = 'Active';
    }

    function createTestVendors() {
        testVendors.forEach(function (v) {
            vendorService.create(v);
        });
    }
}

