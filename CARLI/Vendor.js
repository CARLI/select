var uuid = require('node-uuid')
;

var dataStore;

module.exports = {

    setStore: function( store ){
        dataStore = store;
    },

    create: function( data ){
        data.id = data.id || uuid.v4(),
        data.type = 'vendor';
        dataStore.save( data );
        return data;
    },

    update: function(){

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
