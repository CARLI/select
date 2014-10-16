var store = {}
  , uuid = require( 'node-uuid' )
;

module.exports = {

    get: function( id ) {
        if( !id ) { 
            throw new Error( 'Requires an id' );
        };

        if ( store[id] ){
            return store[id];
        }
        
        throw new Error( 'Id not found' );
    },

    save: function( data ) {
        if ( !data ) {
            throw new Error( 'Requires Data' );  
        };

        var id = data.id || uuid.v4();
        store[ id ] = data;

        return id; 
    }
};
