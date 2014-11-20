angular.module('carli.mockLocationService', [])
    .factory('mockLocationService', function mockLocationService($q) {
        return {
            path: function(){}
        };
    });