var Entity = require('../Entity')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
    , EntityTransform = require( './EntityTransformationUtils')
    ;

var LicenseRepository = Entity('License');
LicenseRepository.setStore( Store( StoreModule(StoreOptions) ) );


/* functions that get added as instance methods on loaded licenses */
var getIsActive = function(){
    if ( this.vendor && this.vendor.isActive != undefined) {
        return this.isActive && this.vendor.isActive;
    }
    return this.isActive;
};

var functionsToAdd = {
    'getIsActive': getIsActive
};

var propertiesToTransform = ['vendor'];

function transformFunction( license ){
    EntityTransform.transformObjectForPersistence(license, propertiesToTransform);
}


function createLicense( license ){
    return LicenseRepository.create( license, transformFunction );
}

function updateLicense( license ){
    return LicenseRepository.update( license, transformFunction );
}

function listLicenses(){
    return EntityTransform.expandListOfObjectsFromPersistence( LicenseRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadLicense( licenseId ){
    var deferred = Q.defer();

    LicenseRepository.load( licenseId )
        .then(function (license) {
            EntityTransform.expandObjectFromPersistence( license, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(license);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    console.warn('*** Cannot find reference in database to vendor in license', err);
                    deferred.resolve(license);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

module.exports = {
    setStore: LicenseRepository.setStore,
    create: createLicense,
    update: updateLicense,
    list: listLicenses,
    load: loadLicense
};
