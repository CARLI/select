var Q = require('q')
    ,VendorR = require('./VendorRepository')
;

var repositories = {
    library : require('./LibraryRepository'),
    license : require('./LicenseRepository'),
    product : require('./ProductRepository'),
    vendor : VendorR
};

function removeEmptyContactsFromEntity(entity) {

    var noEmptiesContactList = [];

    for (var i = 0; i < entity.contacts.length; i++) {
        contact = entity.contacts[i];

        if ((contact.name && contact.name.length > 0) ||
            (contact.email && contact.email > 0) ||
            (contact.phoneNumber && contact.phoneNumber > 0)) {

            noEmptiesContactList.push(contact);
        }
    }
    entity.contacts = noEmptiesContactList;
}


function transformObjectForPersistence(entity, propertiesToTransform) {
    _replaceObjectsWithIds(entity, propertiesToTransform);
    _removeHelperFunctions(entity);
}

function _replaceObjectsWithIds(entity, propertiesToTransform) {
    for (var property in propertiesToTransform) {
        if (_isNonNullObject(entity, property)) {
            entity[property] = entity[property].id;
        }
    }
}

function _removeHelperFunctions(entity){
    for (property in entity){
        if( entity.hasOwnProperty(property) && typeof(entity[property]) === 'function') {
            delete entity[property];
        }
    }
}

function _isNonNullObject(entity, prop) {
    return (entity[prop] && typeof entity[prop] === 'object');
}



function expandObjectFromPersistence(entity, referencesToExpand, functionsToAdd) {
    _addFunctionsToEntityInstance(entity, functionsToAdd);
    return _fetchAndTransformObjectsFromReferences(entity, referencesToExpand);
}

function _addFunctionsToEntityInstance(entity, functionsToAdd) {
    for ( var functionName in functionsToAdd ){
        entity[functionName] = functionsToAdd[functionName];
    }
}

function _fetchAndTransformObjectsFromReferences(entity, references) {
    return _fetchAllObjectsFromReferences(entity, references)
        .then( function( resolvedObjects ){
            _transformReferencesToObjects(entity, resolvedObjects);
            return entity;
        });
}

function _fetchAllObjectsFromReferences(entity, referencesArray) {
    var promises = [];

    for (var i in referencesArray) {
        var property = referencesArray[i];

        /*********
         * NOTE: If we ever need 2-way references (e.g., a product contains a vendor and a vendor contains a product list)
         * the load call here will recurse forever.  Will need to impose a recursion limit so that we only dive down
         * one level deep to expand references into objects. (or, we only want to expand one type of object once)
         *********/
        if (entity[property]) {
            promises.push( repositories[property].load(entity[property]) );
        }
    }

    return Q.all(promises);
}

function _transformReferencesToObjects(entity, resolvedObjects) {
    for (var i in resolvedObjects) {
        var object = resolvedObjects[i];
        for ( var property in entity ){
            if ( entity[property] === object.id){
                entity[property] = object;
            }
        }
    }
}

module.exports = {
    removeEmptyContactsFromEntity: removeEmptyContactsFromEntity,
    transformObjectForPersistence: transformObjectForPersistence,
    expandObjectFromPersistence: expandObjectFromPersistence
};