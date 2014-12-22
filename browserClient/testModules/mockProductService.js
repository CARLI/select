angular.module('carli.mockProductService', [])
    .factory('mockProductService', function mockProductService($q) {

        var mockProductList = [];

        return {
            createOrUpdate: 'neither',
            setTestData: function (data) {
                mockProductList = data;
            },
            list: function () {
                var deferred = $q.defer();
                deferred.resolve(mockProductList);
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
                deferred.resolve( mockProductList[0] );
                return deferred.promise;
            },
            listAvailableOneTimePurchaseProducts: function () {
                var deferred = $q.defer();
                deferred.resolve(mockProductList);
                return deferred.promise;
            },
            getProductDetailCodeOptions: function(){
                return [];
            }
        };
    });
