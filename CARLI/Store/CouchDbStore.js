var Q = require('q')
  , request = require( 'request' )
  , config = require( '../config' )
  , db_host = config.couchDbUrl + '/' + config.couchDbName
;

function _cloneData( data ) {
    return JSON.parse( JSON.stringify( data ) );
};

function typeExistsInStore( type ) {
    var deferred = Q.defer();
    request({ url: db_host + '/' + '_design/CARLI/_view/docTypes?group=true' },
        function ( err, response, body ) {
            var data = JSON.parse( body );
            if( data.rows ) {
                data.rows.forEach( function( row ) {
                    if( row.key == type ) {
                        deferred.resolve();
                    }
                } );
                deferred.reject();
            }
            else {
                deferred.reject();
            }
        }
    );
    return deferred.promise;
}

function idForTypeExistsInStore( type, id ) {
    var deferred = Q.defer();
    request({ url: db_host + '/' + id },
        function ( err, response, body ) {
            data = JSON.parse( body );
            if( data.id && data.id == id && data.type == type ) {
                 deferred.resolve();
            }
            else {
                deferred.reject();
            }
        }
    );
    return deferred.promise;
}

function getDataFor( type, id ) {
    var deferred = Q.defer();
    request({ url: db_host + '/' + id },
        function ( err, response, body ) {
            var data = JSON.parse( body );
            delete data._id;
            delete data._rev;
            var error = err || data.error;
            if( error ) {
                deferred.reject( error );
            }
            else {
                deferred.resolve( data );
            }
        }
    );
    return deferred.promise;
}

function storeData( data ) {
    var deferred = Q.defer();
    request({
      uri: db_host + '/' + data.id,
      json: data,
      method: "PUT"
    }, function( err, response, body ) {
        data._rev = body.rev;
        var error = err || body.error;
        if( error ) {
            deferred.reject( error );
        }
        else {
            deferred.resolve( data );
        }
    } );

    return deferred.promise;
}

function listDataFor( type ) {
    var deferred = Q.defer();
    request({ url: db_host + '/_design/CARLI/_view/listByType?key="' + type + '"' },
        function ( err, response, body ) {
            var data = JSON.parse( body );
            var error = err || data.error;
            if( error ) {
                deferred.reject( error );
            }
            else {
                var results = [];
                data.rows.forEach( function( row ) {
                    results.push( row.value );
                } );
                deferred.resolve( results );
            }
        }
    );
    return deferred.promise;
}

function deleteDataFor( type, id ) {
    var deferred = Q.defer();

    request( { uri: db_host + '/' + id },
      function( err, response, body ) {
          var data = JSON.parse( body );
          var error = err || data.error;
          if( error ) {
              deferred.reject( error );
          }
          else {
              request( {uri: db_host + '/' + id + '?rev=' + data._rev, method: 'DELETE' },
                  function( err, response, body ) {
                      var error = err || data.error;
                      if( error ) {
                          deferred.reject( error );
                      }
                      else {
                          deferred.resolve();
                      }
                  }
              );
          }
    } );
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
