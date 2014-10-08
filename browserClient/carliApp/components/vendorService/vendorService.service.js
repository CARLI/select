angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService($resource) {
    var service = {};
    var vendorListResource = $resource('/resources/vendorList.json');

    service.getVendorList = vendorListResource.query;
    service.getVendor = function( vendorId ){
        var vendorResource = $resource('/resources/vendors/'+vendorId+'/vendor.json');
        return vendorResource.get();
    };

    return service;
}