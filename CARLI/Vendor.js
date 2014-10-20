var uuid = require( 'node-uuid' )
  , tv4  = require( 'tv4' )
  , fs   = require( 'fs' )
  , schemaFile = '../schemas/vendor.json'
;

var dataStore;

function validateCreateData( data ){
    var schema = JSON.parse( fs.readFileSync( schemaFile ) );
    var valid = tv4.validate( data, schema );
    if ( ! valid ) {
        throw new Error( tv4.error.message );
    };
}

function validateUpdateData( data ){
    if ( !data ){
        throw new Error( 'Data Required' );
    }

    if ( !data.id ){
        throw new Error( 'Id Required' );
    }
}


module.exports = {

    setStore: function( store ){
        dataStore = store;
    },

    create: function( data ){
        if ( !data ){
            throw new Error( 'Data Required' );
        }
        data.id = data.id || uuid.v4(),
        data.type = 'vendor';

        validateCreateData( data );

        dataStore.save( data );
        return data;
    },

    update: function( data ){
        validateUpdateData( data );
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
