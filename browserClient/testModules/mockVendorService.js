angular.module('carli.mockVendorService', [])
    .factory('mockVendorService', function mockVendorService($q) {

        var mockVendorList = [];

        return {
            createOrUpdate: 'neither',
            setTestData: function (data) {
                mockVendorList = data;
            },
            list: function () {
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            },
            create: function () {
                var deferred = $q.defer();
                this.createOrUpdate = 'create';
                deferred.resolve();
                return deferred.promise;
            },
            update: function () {
                var deferred = $q.defer();
                this.createOrUpdate = 'update';
                deferred.resolve();
                return deferred.promise;
            },
            load: function () {
                var deferred = $q.defer();
                deferred.resolve(mockVendorList[0]);
                return deferred.promise;
            }
        };
    });