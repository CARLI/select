var Q = require( 'q' )
;

function ensureGetOptionsExist( options ){
    if( !options || !options.id ) {
        throw new Error( 'Requires an id' );
    };
}

function ensureGetOptionsHastype( options ){
    if ( !options.type ){
        throw new Error( 'Requires a type' );
    }
}

function ensureGetOptionsAreValid( options ){
    ensureGetOptionsExist( options );
    ensureGetOptionsHastype( options );
}

function ensureSaveDataArgumentExists( data ) {
    if ( !data ) {
        throw new Error( 'Requires Data' );
    };
}

function ensureSaveDataHasId( data ) {
    if ( !data.id ){
        throw new Error( 'Requires id property' );
    }
};

function ensureSaveDataIsValid( data ) {
    ensureSaveDataArgumentExists( data );
    ensureSaveDataHasId( data );
}

function toGetOrDelete( myStore, options, toDelete ) {
    ensureGetOptionsAreValid( options );

    return toDelete
            ? myStore.deleteDataFor( options.type, options.id )
            : myStore.getDataFor( options.type, options.id )
}

module.exports = function( storeType ) {

    var myStore = storeType;

    return {

        get: function( options ) {
            var deferred = Q.defer();
            toGetOrDelete( myStore, options )
            .then( function( result ) {
                deferred.resolve( result );
            } )
            .catch( function( result ) {
                deferred.reject( result );
            } );
            return deferred.promise;
        },

        save: function( data ) {
            var deferred = Q.defer();
            try {
                ensureSaveDataIsValid( data );
                deferred.resolve( myStore.storeData( data ) );
            } catch( err ) {
                throw err;
            }
            return deferred.promise;
        },

        list: function( type, collection ) {
            if( ! type ) {
                throw new Error( 'Must Specify Type' );
            }
            return myStore.listDataFor( type, collection );
        },

        delete: function( options ) {
            return toGetOrDelete( myStore, options, true );
        }

    };
};
