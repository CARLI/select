var memoryStore = {}
  , store = require( './_Store' )
  , uuid = require( 'node-uuid' )
;

function typeExistsInStore( type ) {
    return memoryStore[type] ? true : false;
}

function idForTypeExistsInStore( type, id ) {
    return memoryStore[type][id] ? true : false;
}

function getDataFor( type, id ) {
    return memoryStore[type][id];
}


function ensureStoreTypeExists( type ) {
    memoryStore[type] = memoryStore[type] || {};
}

function storeData( data ) {
    memoryStore[ data.type ][ data.id ] = data;
    return data.id;
}

module.exports = {

    get: function( options ) {
        store.ensureGetOptionsAreValid( options );

        if ( typeExistsInStore( options.type ) ) {
            if ( idForTypeExistsInStore( options.type, options.id ) ){
                return getDataFor( options.type, options.id );
            }

            throw new Error( 'Id not found' );
        }

        throw new Error( 'Type not found' );
    },

    save: function( data ) {
        store.ensureSaveDataIsValid( data );
        ensureStoreTypeExists( data.type );
        return storeData( data );
    }
};
