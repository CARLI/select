var memoryStore = {}
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
  typeExistsInStore: typeExistsInStore,
  idForTypeExistsInStore: idForTypeExistsInStore,
  getDataFor: getDataFor,
  ensureStoreTypeExists: ensureStoreTypeExists,
  storeData: storeData
}
