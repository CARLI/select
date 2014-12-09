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
        transformObjectsToReferences: function (entity, propertyList) {
            for (var i in propertyList) {
                var prop = propertyList[i];
                if (typeof entity[prop] === 'object') {
                    entity[prop] = entity[prop].id;
                }
            }
        },
        fetchObjectsForReferences: function (entity, servicesByProperty) {
            var promises = {};
            for (var prop in servicesByProperty) {
                promises[prop] = servicesByProperty[prop].load(entity[prop]);
            }
            return $q.all(promises);
        },
        transformReferencesToObjects: function (entity, resolvedObjects) {
            for (var prop in resolvedObjects) {
                entity[prop] = resolvedObjects[prop];
            }
        }
    };
}
