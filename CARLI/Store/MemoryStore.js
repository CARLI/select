var memoryStore = {},
    Q = require('q')
;

function typeExistsInStore( type ) {
    var deferred = Q.defer();
    memoryStore[type]
        ? deferred.resolve()
        : deferred.reject();
    return deferred.promise;
}

function idForTypeExistsInStore( type, id ) {
    var deferred = Q.defer();
    memoryStore[type][id]
        ? deferred.resolve(true)
        : deferred.reject(false);
    return deferred.promise;
}

function getDataFor( type, id ) {
    var deferred = Q.defer();

    if ( memoryStore[type] && memoryStore[type][id] ){
        deferred.resolve( _cloneData(memoryStore[type][id]) );
    }
    else {
        deferred.reject( 'not_found' );
    }

    return deferred.promise;
}

function _ensureStoreTypeExists( type ) {
    memoryStore[type] = memoryStore[type] || {};
}

function _cloneData( data ) {
    return JSON.parse( JSON.stringify( data ) );
}

function storeData( data ) {
    _ensureStoreTypeExists( data.type );
    var deferred = Q.defer();
    memoryStore[ data.type ][ data.id ] = data;
    deferred.resolve( JSON.parse( JSON.stringify( data ) ) );
    return deferred.promise;
}

function listDataFor( type ) {
    var deferred = Q.defer();
    var promises = [];
    for( id in memoryStore[ type ] ) {
        promises.push( getDataFor( type, id ) );
    };
    Q.all(promises).then (function (objects) {
        deferred.resolve( objects );
    });
    return deferred.promise;
}

function deleteDataFor( type, id ) {
    var deferred = Q.defer();
    delete memoryStore[type][id];
    deferred.resolve();
    return deferred.promise;
}

module.exports = function ( options ) {
  return {
    typeExistsInStore: typeExistsInStore,
    idForTypeExistsInStore: idForTypeExistsInStore,
    getDataFor: getDataFor,
    storeData: storeData,
    listDataFor: listDataFor,
    deleteDataFor: deleteDataFor
  }
}
