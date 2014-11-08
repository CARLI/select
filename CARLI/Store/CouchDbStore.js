var Q = require('q')
  , request = require( 'request' )
  , db_host = 'http://localhost:5984/testy'
;

function typeExistsInStore( type ) {
/*
    var deferred = Q.defer();
    memoryStore[type]
        ? deferred.resolve()
        : deferred.reject();
    return deferred.promise;
*/
}

function idForTypeExistsInStore( type, id ) {
/*
    var deferred = Q.defer();
    memoryStore[type][id]
        ? deferred.resolve(true)
        : deferred.reject(false);
    return deferred.promise;
*/
}

function getDataFor( type, id ) {
/*
    var deferred = Q.defer();
    deferred.resolve( JSON.parse( JSON.stringify( memoryStore[type][id] ) ) );
    return deferred.promise;
*/
}

function storeData( data ) {
    var deferred = Q.defer();

    request({
      uri: db_host + '/' + data.id,
      json: data,
      method: "PUT"
    }, function( err, response, body ) {
        var error = err || body.error;
        if( error ) { 
            deferred.reject( error ); 
        }
        else {
            deferred.resolve( data.id );
        }
    } );

    return deferred.promise;
}

function listDataFor( type ) {
/*
    var deferred = Q.defer();
    var objects = [];
    for( id in memoryStore[ type ] ) {
        objects.push( getDataFor( type, id ) );
    };
    deferred.resolve( objects );
    return deferred.promise;
*/
}

function deleteDataFor( type, id ) {
/*
    var deferred = Q.defer();
    delete memoryStore[type][id];
    deferred.resolve();
    return deferred.promise;
*/
}

module.exports = function ( options ) {
  return {
//    typeExistsInStore: typeExistsInStore,
//    idForTypeExistsInStore: idForTypeExistsInStore,
//    getDataFor: getDataFor,
    storeData: storeData,
//    listDataFor: listDataFor,
//    deleteDataFor: deleteDataFor
  }
}
