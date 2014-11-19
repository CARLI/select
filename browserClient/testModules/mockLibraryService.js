angular.module('carli.mockLibraryService', [])
    .factory('mockLibraryService', function mockLibraryService($q) {
        return {
            createOrUpdate: 'neither',
            list: function () {
                var deferred = $q.defer();
                deferred.resolve();
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
                deferred.resolve(
                    {
                        name: 'Test Library'
                    }
                );
                return deferred.promise;
            },
            reset: function () {
                this.createOrUpdate = 'neither';
            }
        };
    });