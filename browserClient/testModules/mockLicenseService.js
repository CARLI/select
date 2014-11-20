angular.module('carli.mockLicenseService', [])
    .factory('mockLicenseService', function mockLicenseService($q) {
        return {
            createOrUpdate: 'neither',
            create: function(){
                var deferred = $q.defer();
                this.createOrUpdate = 'create';
                deferred.resolve([]);
                return deferred.promise;
            },
            update: function(){
                var deferred = $q.defer();
                this.createOrUpdate = 'update';
                deferred.resolve();
                return deferred.promise;
            },
            load: function(){
                var deferred = $q.defer();
                deferred.resolve(
                    {
                        name: 'Test License'
                    }
                );
                return deferred.promise;
            }
        };
    });