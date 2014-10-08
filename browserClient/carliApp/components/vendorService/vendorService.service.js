angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService($resource) {
    var service = {};
    var vendorResource = $resource('/resources/vendorList.json');
    service.getVendors = vendorResource.query;
    return service;
}