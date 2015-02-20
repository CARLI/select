angular.module('carli.mockOfferingService', [])
    .factory('mockOfferingService', function mockOfferingService($q){

        var mockOfferingList = [];

        return {
            createOrUpdate: 'neither',
            setTestData: function (data) {
                mockOfferingList = data;
            },
            list: function () {
                var deferred = $q.defer();
                deferred.resolve(mockOfferingList);
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
                deferred.resolve( mockOfferingList[0] );
                return deferred.promise;
            },
            listOfferingsForLibraryId: function ( libraryId ) {
                var deferred = $q.defer();
                deferred.resolve(mockOfferingList);
                return deferred.promise;
            },
            listOfferingsForProductId: function ( productId ) {
                var deferred = $q.defer();
                deferred.resolve(mockOfferingList);
                return deferred.promise;
            },
            getOfferingDisplayOptions: function() {
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            },
            getOfferingDisplayLabels: function(){
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            }
        };
    });
