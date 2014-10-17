var memoryStore = {}
  ,store = require( './_Store' )
  , uuid = require( 'node-uuid' )
;

function ensureStoreTypeExists( type ){
    memoryStore[type] = memoryStore[type] || {};
}

module.exports = {

    get: function( options ) {
        store.ensureGetOptionsAreValid( options );

        if ( memoryStore[options.type] ){
            if ( memoryStore[options.type][options.id] ){
                return memoryStore[options.type][options.id];
            }

            throw new Error( 'Id not found' );
        }

        throw new Error( 'Type not found' );
    },

    save: function( data ) {
        store.ensureSaveDataIsValid( data );
        ensureStoreTypeExists( data.type );
        memoryStore[ data.type ][ data.id ] = data;
        return data.id; 
    }
};
