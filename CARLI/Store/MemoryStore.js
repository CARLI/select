var memoryStore = {}
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
    deferred.resolve( JSON.parse( JSON.stringify( memoryStore[type][id] ) ) );
    return deferred.promise;
}

function _ensureStoreTypeExists( type ) {
    memoryStore[type] = memoryStore[type] || {};
}

function storeData( data ) {
    var deferred = Q.defer();
    _ensureStoreTypeExists( data.type );
    memoryStore[ data.type ][ data.id ] = data;
    deferred.resolve( data.id );
    return deferred.promise;
}

function listDataFor( type ) {
      var objects = [];
      for( id in memoryStore[ type ] ) {
        objects.push( getDataFor( type, id ) );
      };
      return objects;
}

function deleteDataFor( type, id ) {
    delete memoryStore[type][id];
    return true;
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
