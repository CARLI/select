var memoryStore = {}
  , fs   = require( 'fs' )
  , resourcePath = '../resources'
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
        fs.mkdirSync( resourcePath, '0777' )
    }
    catch(err){
        if ( err.code !== 'EEXIST' ) {
            throw new Error(err);
        }
    }

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

function listDataFor( type ) {
    var files = fs.readdirSync( resourcePath + '/' + type );
    var list = [];
    files.forEach( function( id ) {
        list.push( getDataFor( type, id.slice(0,-5) ) );
    } );
    return list;
}

function deleteDataFor( type, id ) {
    try {
        fs.unlinkSync( resourcePath + '/' + type + '/' + id + '.json' );
        return true;
    }
    catch( e ){
        return false;
    }
    return false;

}


module.exports = {
  typeExistsInStore: typeExistsInStore,
  idForTypeExistsInStore: idForTypeExistsInStore,
  getDataFor: getDataFor,
  ensureStoreTypeExists: ensureStoreTypeExists,
  storeData: storeData,
  listDataFor: listDataFor,
  deleteDataFor: deleteDataFor
}
