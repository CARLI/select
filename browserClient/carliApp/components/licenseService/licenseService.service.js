angular.module('carli.licenseService')
    .service('licenseService', licenseService);

function licenseService( CarliModules, $q, entityBaseService, vendorService ) {

    var licenseModule = CarliModules.License;

    var licenseStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    licenseModule.setStore( licenseStore );

    function listLicenses() {
        var licenseList;
        var deferred = $q.defer();

        var p = $q.when(licenseModule.list());
        var promises = [ p ];

        p.then(function (licenses) {
            licenseList = licenses;
            licenses.forEach(function (license) {
                var p = fetchAndTransformObjectsForReferences(license);
                promises.push(p);
            });
        }).catch(function (err) {
            deferred.reject(err);
        });

        $q.all(promises).then(function () {
            deferred.resolve(licenseList);
        });
        return deferred.promise;
    }
    return {
        list:   listLicenses,
        create: function(license) {
            transformObjectsToReferences(license);
            return $q.when( licenseModule.create(license) );
        },
        update: function(license) {
            var deferred = $q.defer();

            var savedVendorObject = license.vendor;
            transformObjectsToReferences(license);

            licenseModule.update(license)
                .then (function(license) {
                deferred.resolve(license);
            })
                .catch(function (err) {
                    deferred.reject(err);
                })
                .finally(function(){
                    license.vendor = savedVendorObject;
                });

            return deferred.promise;
        },
        load:   function(id) {
            var deferred = $q.defer();

            licenseModule.load(id)
                .then(function (license) {
                    fetchAndTransformObjectsForReferences(license)
                        .then(function (license) {
                            deferred.resolve(license);
                        });
                })
                .catch(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }
    };


    function transformObjectsToReferences(license) {
        entityBaseService.transformObjectsToReferences(license, [ 'vendor' ]);
    }

    function fetchAndTransformObjectsForReferences(license) {
        return entityBaseService.fetchObjectsForReferences(license, { 'vendor': vendorService })
            .then( function( resolvedObjects ){
                entityBaseService.transformReferencesToObjects(license, resolvedObjects);
                return license;
            });
    }
}
