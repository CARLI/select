angular.module('carli.mockVendorService', [])
    .factory('mockVendorService', function mockVendorService($q) {
        return {
            createOrUpdate: 'neither',
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
                deferred.resolve(
                    {
                        type: 'Vendor',
                        name: 'Test Vendor',
                        contacts: [
                            {
                                "contactType": "Billing",
                                "name": "Bob Martin",
                                "email": "bob@cleancode.org",
                                "phoneNumber": "123-555-1234"
                            }
                        ]

                    }
                );
                return deferred.promise;
            }
        };
    });