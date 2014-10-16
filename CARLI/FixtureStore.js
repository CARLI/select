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

function ensureGetOptionsAreValid( options ){
    ensureGetOptionsExist( options );
    ensureGetOptionsHastype( options );
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
        ensureGetOptionsAreValid( options );

        if ( store[options.type] ){
            if ( store[options.type][options.id] ){
                return store[options.type][options.id];
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
