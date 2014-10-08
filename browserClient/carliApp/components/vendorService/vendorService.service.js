angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService($resource) {
    var service = {};
    var vendorListResource = $resource('/resources/vendor/list.json');

    service.getVendorList = vendorListResource.query;
    service.getVendor = function( vendorId ){
        var vendorResource = $resource('/resources/vendor/'+vendorId+'/data.json');
        return vendorResource.get();
    };

    return service;
}