var uuid  = require( 'node-uuid' )
  , tv4   = require( 'tv4' )
  , schema = require( '../schemas/vendor.json' )
;

var dataStore;
function throwIfDataIsEmpty ( data ) {
    if ( !data ){
        throw new Error( 'Data Required' );
    }
}

function validateCreateData( data ){
    throwIfDataIsEmpty( data );
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

function _cloneData ( data ) {
    return JSON.parse( JSON.stringify( data ) );
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
        return _cloneData( data );
    },

    update: function( data ){
        validateUpdateData( data );
        if ( dataStore.save( data ) ) {
            return _cloneData( data );
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
