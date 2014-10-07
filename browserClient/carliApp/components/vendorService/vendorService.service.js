angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService($resource) {
    var service = {};
    var vendorResource = $resource('/resources/vendor.json');
    service.getVendors = vendorResource.query;
    return service;
}