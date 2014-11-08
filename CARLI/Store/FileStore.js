var memoryStore = {}
  , fs   = require( 'fs' )
  , resourcePath = undefined
  , Q = require( 'q' )
;

function typeExistsInStore( type ) {
    var deferred = Q.defer();

    fs.stat( resourcePath + '/' + type, function( err, stats ) {
        if ( err ) {
            deferred.reject();
        }
        else {
            stats.isDirectory()
                ? deferred.resolve()
                : deferred.reject();
        }
    } );

    return deferred.promise;
}

function idForTypeExistsInStore( type, id ) {
    var deferred = Q.defer();

    fs.stat( resourcePath + '/' + type + '/' + id + '.json', function( err, stats ) {
        if ( err ) {
            deferred.reject();
        }
        else {
            stats.isFile()
                ? deferred.resolve()
                : deferred.reject();
        }
    } );

    return deferred.promise;
}

function getDataFor( type, id ) {
    var deferred = Q.defer();

    fs.readFile( resourcePath + '/' + type + '/' + id + '.json', function( err, data ) {
        err
            ? deferred.reject( err )
            : deferred.resolve( JSON.parse( data ) );
    } );

    return deferred.promise;
}

function _ensureStoreTypeExists( type ) {
    try {
        fs.mkdirSync( resourcePath, '0777' )
    }
    catch(err){
        if ( err.code !== 'EEXIST' ) {
            throw new Error(err);
        }
    }

    try {
        fs.mkdirSync( resourcePath + '/' + type, '0777' );
    }
    catch(err) { 
        if ( err.code == 'EEXIST' ) {
            return true;
        }
        throw new Error(err);
    };
}

function storeData( data ) {
    _ensureStoreTypeExists( data.type );

    var deferred = Q.defer();

    fs.writeFile(
        resourcePath + '/' + data.type + '/' + data.id + '.json',
        JSON.stringify(data),
        function( err ) {
            err
                ? deferred.reject()
                : deferred.resolve( data.id );
        }
    ); 

    return deferred.promise; 
}

function listDataFor( type ) {
    var deferred = Q.defer();

    fs.readdir( resourcePath + '/' + type, function( err, files ) {
        if ( err ) {
            deferred.resolve( [] );
        }
        else {
            var list = [];
            files.forEach( function( id ) {
                list.push( getDataFor( type, id.slice(0,-5) ) );
            } );
            deferred.resolve( list );  
        }
    } );

    return deferred.promise;
}

function deleteDataFor( type, id ) {
    var deferred = Q.defer();

    fs.unlink( resourcePath + '/' + type + '/' + id + '.json', function( err ) {
        err
            ? deferred.reject()
            : deferred.resolve();
    } );

    return deferred.promise;
}


module.exports = function( options ) {
    resourcePath = options.resourcePath;
    return {
        typeExistsInStore: typeExistsInStore,
        idForTypeExistsInStore: idForTypeExistsInStore,
        getDataFor: getDataFor,
        storeData: storeData,
        listDataFor: listDataFor,
        deleteDataFor: deleteDataFor
    }
}
