var store = {}
  , uuid = require( 'node-uuid' )
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

function ensureStoreTypeExists( type ){
    store[type] = store[type] || {};
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

function ensureSaveDataHasType( data ) {
    if ( !data.type ){
        throw new Error( 'Requires type property' );
    }
}

function ensureSaveDataIsValid( data ) {
    ensureSaveDataArgumentExists( data );
    ensureSaveDataHasId( data );
    ensureSaveDataHasType( data );
    ensureStoreTypeExists( data.type );
}

module.exports = {

    get: function( options ) {
        var id, type;

        ensureGetOptionsExist( options );
        id = options.id;

        ensureGetOptionsHastype( options );
        type = options.type;

        if ( store[type] ){
            if ( store[type][id] ){
                return store[type][id];
            }

            throw new Error( 'Id not found' );
        }

        throw new Error( 'Type not found' );
    },

    save: function( data ) {
        ensureSaveDataIsValid( data );
        store[ data.type ][ data.id ] = data;
        return data.id; 
    }
};
