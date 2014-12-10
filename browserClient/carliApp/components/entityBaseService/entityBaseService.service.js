angular.module('carli.entityBaseService')
    .service('entityBaseService', entityBaseService);


function entityBaseService( CarliModules, $q ) {

    return {
        removeEmptyContactsFromEntity: removeEmptyContactsFromEntity,
        transformObjectsToReferences: transformObjectsToReferences,
        fetchAndTransformObjectsFromReferences: fetchAndTransformObjectsFromReferences,
        expandReferencesToObjects: expandReferencesToObjects,
        saveReferences: saveReferences,
        restoreReferences: restoreReferences
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
    function transformObjectsToReferences(entity, references) {
        for (var property in references) {
            if (_isNonNullObject(entity, property)) {
                entity[property] = entity[property].id;
            }
        }
    }
    function fetchAndTransformObjectsFromReferences(entity, references) {
        return _fetchObjectsForReferences(entity, references)
            .then( function( resolvedObjects ){
                _transformReferencesToObjects(entity, resolvedObjects);
                return entity;
            });
    }
    function expandReferencesToObjects(promise, references) {
        var list;
        var deferred = $q.defer();

        var promises = [ promise ];

        promise.then(function (entities) {
            list = entities;
            entities.forEach(function (entity) {
                var p = fetchAndTransformObjectsFromReferences(entity, references);
                promises.push(p);
            });
        }).catch(function (err) {
            deferred.reject(err);
        });

        $q.all(promises).then(function () {
            deferred.resolve(list);
        });
        return deferred.promise;
    }
    function saveReferences(entity, references) {
        var savedObjects = {};
        for (var property in references) {
            savedObjects[property] = entity[property];
        }
        return savedObjects;
    }
    function restoreReferences(entity, savedObjects, references) {
        for (var property in references) {
            entity[property] = savedObjects[property];
        }
    }

    function _isNonNullObject(entity, prop) {
        return (entity[prop] && typeof entity[prop] === 'object');
    }

    function _fetchObjectsForReferences(entity, references) {
        var promises = {};
        for (var property in references) {
            if (entity[property]) {
                promises[property] = references[property].load(entity[property]);
            }
        }
        return $q.all(promises);
    }

    function _transformReferencesToObjects(entity, resolvedObjects) {
        for (var prop in resolvedObjects) {
            entity[prop] = resolvedObjects[prop];
        }
    }
}
