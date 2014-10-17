var uuid = require('node-uuid')
;

var dataStore;

function validateCreateData( data ){
    if ( !data ){
        throw new Error( 'Data Required' );
    }
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
        validateCreateData( data );

        data.id = data.id || uuid.v4(),
        data.type = 'vendor';
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
