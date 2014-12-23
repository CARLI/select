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
                        type: 'License',
                        name: 'Test License',
                        isActive: true
                    }
                );
                return deferred.promise;
            },
            listLicensesForVendorId: function(){
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            }
        };
    });