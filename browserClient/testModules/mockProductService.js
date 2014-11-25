angular.module('carli.mockProductService', [])
    .factory('mockProductService', function mockProductService($q) {
        var mockProductList = [
            {
                type: 'Product',
                name: 'Test Product 0',
                cycleType: 'Fiscal Year',
                isActive: true
            },
            {
                type: 'Product',
                name: 'Test Product 1',
                cycleType: 'Calendar Year',
                isActive: true
            },
            {
                type: 'Product',
                name: 'Test Product 2',
                cycleType: 'Fiscal Year',
                isActive: false
            },
            {
                type: 'Product',
                name: 'Test Product 3',
                cycleType: 'Calendar Year',
                isActive: false
            },
            {
                type: 'Product',
                name: 'Test Product 4',
                cycleType: 'One-Time Purchase',
                isActive: true,
                oneTimePurchase: {
                    libraryPurchaseData: {
                        testLibraryId: {
                            datePurchased: '2015-01-01',
                            price: 100
                        }
                    }
                }
            },
            {
                type: 'Product',
                name: 'Test Product 5',
                cycleType: 'One-Time Purchase',
                isActive: true,
                oneTimePurchase: {
                    libraryPurchaseData: {
                        testLibraryId: {
                            datePurchased: '2015-01-01',
                            price: 100
                        }
                    }
                }
            },
            {
                type: 'Product',
                name: 'Test Product 6 Unpurchased',
                cycleType: 'One-Time Purchase',
                isActive: true,
                oneTimePurchase: {
                    libraryPurchaseData: {
                        testLibraryId: {
                        }
                    }
                }
            }
        ];

        return {
            createOrUpdate: 'neither',
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
            listOneTimePurchaseProducts: function () {
                var deferred = $q.defer();
                deferred.resolve(mockProductList);
                return deferred.promise;
            }
        };
    });