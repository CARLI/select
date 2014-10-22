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
}

function toGetOrDelete( myStore, options, toDelete ) {
    ensureGetOptionsAreValid( options );

    if ( myStore.typeExistsInStore( options.type ) ) {
        if ( myStore.idForTypeExistsInStore( options.type, options.id ) ){
            return toDelete
              ? myStore.deleteDataFor( options.type, options.id )
              : myStore.getDataFor( options.type, options.id ); 
        }
        throw new Error( 'Id not found' );
    }
    throw new Error( 'Type not found' );
}

module.exports = function( storeType ) {

    var myStore = storeType;

    return {

        get: function( options ) {
            return toGetOrDelete( myStore, options );
        },

        save: function( data ) {
            ensureSaveDataIsValid( data );
            myStore.ensureStoreTypeExists( data.type );
            return myStore.storeData( data );
        },

        list: function( type ) {
          if( ! type ) {
            throw new Error( 'Must Specify Type' );
          };
          if ( myStore.typeExistsInStore( type ) ) {
            return myStore.listDataFor( type );
          };
          return [];
        },

        delete: function( options ) {
            return toGetOrDelete( myStore, options, true );
        } 

    };
};
