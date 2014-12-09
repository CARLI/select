angular.module('carli.licenseService')
    .service('licenseService', licenseService);

function licenseService( CarliModules, $q, entityBaseService, vendorService ) {

    var references = { vendor: vendorService };
    var licenseModule = CarliModules.License;
    var licenseStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );
    licenseModule.setStore( licenseStore );

    return {
        list:   listLicenses,
        create: createLicense,
        update: updateLicense,
        load:   loadLicense
    };

    function listLicenses() {
        return entityBaseService.expandReferencesToObjects($q.when(licenseModule.list()), references);
    }

    function createLicense(license) {
        entityBaseService.transformObjectsToReferences(license, references);
        return $q.when( licenseModule.create(license) );
    }

    function updateLicense(license) {
        var deferred = $q.defer();
        var savedObjects = entityBaseService.saveReferences(license, references);
        entityBaseService.transformObjectsToReferences(license, references);

        licenseModule.update(license)
            .then(function (license) {
               deferred.resolve(license);
            })
            .catch(function (err) {
                deferred.reject(err);
            })
            .finally(function () {
                entityBaseService.restoreReferences(license, savedObjects);
            });

        return deferred.promise;
    }

    function loadLicense(id) {
        var deferred = $q.defer();

        licenseModule.load(id)
            .then(function (license) {
                entityBaseService.fetchAndTransformObjectsFromReferences(license, references)
                    .then(function (license) {
                        deferred.resolve(license);
                    });
            })
            .catch(function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }
}
