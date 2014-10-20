var memoryStore = {}
  , store = require( './_Store' )
  , uuid = require( 'node-uuid' )
  , fs   = require( 'fs' )
  , resourcePath = '../Resources'
;

function typeExistsInStore( type ) {
    try {
        return fs.statSync( resourcePath + '/' + type ).isDirectory();
    }
    catch( e ){
        return false;
    }
}

function idForTypeExistsInStore( type, id ) {
    try {
        return fs.statSync( resourcePath + '/' + type + '/' + id + '.json' ).isFile();
    }
    catch( e ){
        return false;
    }
}

function getDataFor( type, id ) {
    try {
        return JSON.parse( fs.readFileSync( resourcePath + '/' + type + '/' + id + '.json' ) );
    }
    catch( e ){
        return false;
    }
}

function ensureStoreTypeExists( type ) {
    try {
        fs.mkdirSync( resourcePath + '/' + type, '0777' );
    }
    catch(err) { 
        if ( err.code == 'EEXIST' ) {
            return true;
        }
        throw new Error(err);
    }; 
}

function storeData( data ) {
    fs.writeFileSync( resourcePath + '/' + data.type + '/' + data.id + '.json', JSON.stringify(data) ); 
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
