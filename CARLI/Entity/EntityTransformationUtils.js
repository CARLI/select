var config = require('../../config');
var CrmLibraryEntity = require('./CrmLibraryEntity');
var Entity = require('../Entity');
var getStoreForCycle = require('./getStoreForCycle');
var Store = require('../Store');
var StoreOptions = config.storeOptions;
var StoreModule = require('../Store/CouchDb/Store');
var Q = require('q');
var Validator = require('../Validator');
var validTypes = Validator.list();
var _ = require('lodash');

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

function transformObjectForPersistence(entity, propertiesToTransform) {
    _replaceObjectsWithIds(entity, propertiesToTransform);
    _removeHelperFunctions(entity);
    setDefaultValuesForEntity(entity);
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

    fetchPromise
        .then(function (resolvedObjects) {
            _transformReferencesToObjects(entity, resolvedObjects);
        })
        .catch(function (err) {
            //Logger.log('  Failed to load a reference, not expanding entity ' + entity.id + ' (' + entity.name + ')', err);
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
            p.catch(function (error) {
                Logger.debug('Failed to load reference to ' + property, entity[property]);
                throw error;
            });
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

function setDefaultValuesForEntity(entity){
    if ( !entity || !entity.type ){
        return;
    }

    if ( validTypes.indexOf(entity.type) === -1 ){
        return;
    }

    var propertiesForType = Validator.getNonIdPropertyMapFor(entity.type);
    var propertyNames = Object.keys(propertiesForType);

    propertyNames.forEach(function(propertyName){
        var propertyType = propertiesForType[propertyName];
        if ( propertyType === 'string' ){
            setDefaultValueForStringProperty(entity, propertyName);
        }
        else if ( propertyType === 'integer' ){
            setDefaultValueForIntegerProperty(entity, propertyName);
        }
        else if ( propertyType === 'date' ){
            entity[propertyName] = convertDateObjectToString(entity[propertyName]);
        }
    });
}
function setDefaultValueForStringProperty(entity, propertyName){
    if ( propertyExistsAndHasUndefinedValue(entity, propertyName) ){
        entity[propertyName] = '';
    }
}

function setDefaultValueForIntegerProperty(entity, propertyName){
    if ( propertyExistsAndHasUndefinedValue(entity, propertyName) ){
        entity[propertyName] = 0;
    }
}

function propertyExistsAndHasUndefinedValue(entity, propertyName){
    return (propertyName in entity) && typeof entity[propertyName] === 'undefined'
}

function convertDateObjectToString( dateObject ){
    if ( !dateObject ){
        return '';
    }
    if ( typeof dateObject === 'object' && typeof dateObject.toISOString === 'function' ){
        return dateObject.toISOString();
    }
    return dateObject;
}

setEntityLookupStores( Store( StoreModule(StoreOptions) ) );

module.exports = {
    transformObjectForPersistence: transformObjectForPersistence,
    expandObjectFromPersistence: expandObjectFromPersistence,
    expandListOfObjectsFromPersistence: expandListOfObjectsFromPersistence,
    setEntityLookupStores: setEntityLookupStores,
    extractValuesForProperties: extractValuesForProperties,
    extractValuesForSchema: extractValuesForSchema,
    setDefaultValuesForEntity: setDefaultValuesForEntity,
    setDefaultValueForStringProperty: setDefaultValueForStringProperty,
    setDefaultValueForIntegerProperty: setDefaultValueForIntegerProperty,
    convertDateObjectToString: convertDateObjectToString
};
