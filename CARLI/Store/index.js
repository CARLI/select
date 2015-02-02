var Q = require('q');


function ensureSaveDataArgumentExists(data) {
    if (!data) {
        throw new Error('Requires Data');
    }
}

function ensureSaveDataHasId(data) {
    if (!data.id) {
        throw new Error('Requires id property');
    }
}

function ensureSaveDataIsValid(data) {
    ensureSaveDataArgumentExists(data);
    ensureSaveDataHasId(data);
}


module.exports = function (storeType) {

    var myStore = storeType;

    return {

        get: function (id) {
            var deferred = Q.defer();

            if ( !id ){
                deferred.reject('Requires id property');
            }
            else {
                deferred.resolve( myStore.getDataFor(id) );
            }

            return deferred.promise;
        },

        save: function (data) {
            var deferred = Q.defer();

            if (!data){
                deferred.reject('Requires Data');
            }
            else if (!data.id) {
                deferred.reject('Requires id property');
            }
            else {
                deferred.resolve(myStore.storeData(data));
            }

            return deferred.promise;
        },

        list: function (type, collection) {
            var deferred = Q.defer();

            if ( !type ){
                deferred.reject('Must Specify Type');
            }
            else {
                deferred.resolve( myStore.listDataFor(type, collection) );
            }

            return deferred.promise;
        },

        delete: function (id) {
            var deferred = Q.defer();

            if ( !id ){
                deferred.reject('Requires id property');
            }
            else {
                deferred.resolve( myStore.deleteDataFor(id) );
            }

            return deferred.promise;
        }

    };
};
