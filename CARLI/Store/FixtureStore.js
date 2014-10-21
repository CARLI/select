var memoryStore = {}
;

function _getListOf( type ) {
      var objects = [];
      for( id in memoryStore[ type ] ) {
        objects.push( memoryStore[ type ][ id ] );
      };
      return objects;
}

function typeExistsInStore( type ) {
    return memoryStore[type] ? true : false;
}

function idForTypeExistsInStore( type, id ) {
    return memoryStore[type][id] ? true : false;
}

function getDataFor( type, id ) {
    return memoryStore[type][id];
}


function ensureStoreTypeExists( type ) {
    memoryStore[type] = memoryStore[type] || {};
}

function storeData( data ) {
    memoryStore[ data.type ][ data.id ] = data;
    return data.id;
}

function listDataFor( type ) {
    if ( typeExistsInStore( type ) ) {
      return _getListOf( type );
    };
    return [];
}

function deleteDataFor( type, id ) {
    delete memoryStore[type][id];
    return true;
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
