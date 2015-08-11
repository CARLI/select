var Q = require('q')
  , CrmLibraryEntity = require('./CrmLibraryEntity')
  , Entity = require('../Entity')
  , config = require( '../../config' )
  , StoreOptions = config.storeOptions
  , Store = require( '../Store' )
  , StoreModule = require( '../Store/CouchDb/Store')
  , _ = require('lodash')
  , Validator = require('../Validator')
  , getStoreForCycle = require('./getStoreForCycle')
  ;

/**
 * These are the basic Entity interactors rather than the full Repositories to avoid circular dependencies in Node, and
 * to prevent infinite recursion if one Entity references another that then references the first. We decided that
 * loading Entities with their references expanded and leaving the references in those sub-entities unexpanded was okay.
 * If you want a fully expanded Entity, use the Repository load function explicitly.
 */
var repositories = {
    cycle : Entity('Cycle'),
    library : CrmLibraryEntity(),
    license : Entity('License'),
    vendor : Entity('Vendor')
};
var cycleBoundRepositories = {
    product : Entity('Product')
};

function setEntityLookupStores( newStore ){
    repositories.cycle.setStore( newStore );
    repositories.license.setStore( newStore );
    repositories.vendor.setStore( newStore );
}

function removeEmptyContactsFromEntity(entity) {
    if ( !entity.contacts ){
        return;
    }

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
    removeEmptyContactsFromEntity(entity);
}

function _replaceObjectsWithIds(entity, propertiesToTransform) {
    for (var i in propertiesToTransform) {
        var property = propertiesToTransform[i];
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

function expandListOfObjectsFromPersistence(objectListPromise, referencesToExpand, functionsToAdd) {
    var deferred = Q.defer();
    var list;
    var promises = [];

    objectListPromise.then(function (entities) {
        list = entities;

        entities.forEach(function (entity) {
            var p = expandObjectFromPersistence(entity, referencesToExpand, functionsToAdd);
            promises.push(p);
        });

        Q.allSettled(promises).then(function () {
            deferred.resolve(list);
        })
    }).catch(function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
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
    var fetchPromise = _fetchAllObjectsFromReferences(entity, references);

    fetchPromise.then( function( resolvedObjects ){
        _transformReferencesToObjects(entity, resolvedObjects);
    })
    .catch(function(err){
        console.log('  Failed to load a reference, not expanding entity '+entity.id+' ('+entity.name+')', err);
    });

    return fetchPromise;
}

function _fetchAllObjectsFromReferences(entity, referencesArray) {
    var promises = [];

    for (var i in referencesArray) {
        var property = referencesArray[i];

        if (entity[property] && typeof entity[property] !== 'object') {
            var p = null;

            if (repositories[property]) {
                p = repositories[property].load(entity[property]);
            }
            else if (cycleBoundRepositories[property]) {
                /* This is for loading reference entities that are tied to a cycle (i.e. products).
                 * We assume that entity.cycle is a fully-loaded cycle object, not just an ID.
                 */
                var repo = cycleBoundRepositories[property];
                repo.setStore( getStoreForCycle(entity.cycle) );
                p = repo.load(entity[property]);
            }
            promises.push( p );
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

function extractValuesForProperties( entity, properties ){
    var extracted = {};
    properties.forEach(function (property) {
        if (entity.hasOwnProperty(property)) {
            extracted[property] = entity[property];
        }
    });
    return extracted;
}
function extractValuesForSchema( entity, schemaType ){
    return extractValuesForProperties( entity, Validator.listNonIdPropertiesFor(schemaType) );
}

setEntityLookupStores( Store( StoreModule(StoreOptions) ) );

module.exports = {
    removeEmptyContactsFromEntity: removeEmptyContactsFromEntity,
    transformObjectForPersistence: transformObjectForPersistence,
    expandObjectFromPersistence: expandObjectFromPersistence,
    expandListOfObjectsFromPersistence: expandListOfObjectsFromPersistence,
    setEntityLookupStores: setEntityLookupStores,
    extractValuesForProperties: extractValuesForProperties,
    extractValuesForSchema: extractValuesForSchema
};
