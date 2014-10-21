var memoryStore = {}
;

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

module.exports = {
  typeExistsInStore: typeExistsInStore,
  idForTypeExistsInStore: idForTypeExistsInStore,
  getDataFor: getDataFor,
  ensureStoreTypeExists: ensureStoreTypeExists,
  storeData: storeData
}
