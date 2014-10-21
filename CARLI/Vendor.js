var uuid = require( 'node-uuid' )
  , tv4  = require( 'tv4' )
  , fs   = require( 'fs' )
  , schemaFile = '../schemas/vendor.json'
;

var dataStore;
function throwIfDataIsEmpty ( data ) {
    if ( !data ){
        throw new Error( 'Data Required' );
    }
}

function validateCreateData( data ){
    throwIfDataIsEmpty( data );
    var schema = JSON.parse( fs.readFileSync( schemaFile ) );
    var valid = tv4.validate( data, schema );
    if ( ! valid ) {
        throw new Error( tv4.error.message );
    };
}

function validateUpdateData( data ){
    throwIfDataIsEmpty( data );
    if ( !data.id ){
        throw new Error( 'Id Required' );
    }
    validateCreateData( data );
}


module.exports = {

    setStore: function( store ){
        dataStore = store;
    },

    create: function( data ){
        validateCreateData( data );

        data.id = data.id || uuid.v4(),
        data.type = 'vendor';

        dataStore.save( data );
        return data;
    },

    update: function( data ){
        validateUpdateData( data );
        if ( dataStore.save( data ) ) {
            return data;
        };
    },
    
    list: function() {
      return dataStore.list( 'vendor' );
    },

    load: function( id ){
        if ( !id ){
            throw new Error('Id Required');
        }
        try {
            return dataStore.get( { id: id, type: 'vendor' } );
        }
        catch( e ) {
            return false;
        } 
    }
};
