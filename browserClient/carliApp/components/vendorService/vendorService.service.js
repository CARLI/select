angular.module('carli.vendorService')
    .service('vendorService', function ($resource) {
        var vendorService = {};
        var vendorResource = $resource('/resources/vendor.json');
        vendorService.getVendors = vendorResource.query;
        return vendorService;
    });