angular.module('carli.entityBaseService')
    .service('entityBaseService', entityBaseService);


function entityBaseService( CarliModules, $q ) {

    return {
        removeEmptyContactsFromEntity: function (entity) {

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
        },
        transformObjectsToReferences: function (entity, references) {
            for (var property in references) {
                if (isNonNullObject(entity, property)) {
                    entity[property] = entity[property].id;
                }
            }
        },
        fetchAndTransformObjectsFromReferences: function (entity, references) {
            return fetchObjectsForReferences(entity, references)
                .then( function( resolvedObjects ){
                    transformReferencesToObjects(entity, resolvedObjects);
                    return entity;
                });
        },
        expandReferencesToObjects: function (promise, references) {
            var list;
            var deferred = $q.defer();

            var promises = [ promise ];

            promise.then(function (entities) {
                list = entities;
                entities.forEach(function (entity) {
                    var p = entityBaseService.fetchAndTransformObjectsForReferences(entity, references);
                    promises.push(p);
                });
            }).catch(function (err) {
                deferred.reject(err);
            });

            $q.all(promises).then(function () {
                deferred.resolve(list);
            });
            return deferred.promise;
        },
        saveReferences: function (entity, references) {
            var savedObjects = {};
            for (var property in references) {
                savedObjects[property] = entity[property];
            }
            return savedObjects;
        },
        restoreReferences: function (entity, savedObjects) {
            for (var property in references) {
                entity[property] = savedObjects[property];
            }
        }
    };

    function isNonNullObject(entity, prop) {
        return (entity[prop] && typeof entity[prop] === 'object');
    }

    function fetchObjectsForReferences(entity, references) {
        var promises = {};
        for (var property in references) {
            if (entity[property]) {
                promises[property] = references[property].load(entity[property]);
            }
        }
        return $q.all(promises);
    }

    function transformReferencesToObjects(entity, resolvedObjects) {
        for (var prop in resolvedObjects) {
            entity[prop] = resolvedObjects[prop];
        }
    }
}
