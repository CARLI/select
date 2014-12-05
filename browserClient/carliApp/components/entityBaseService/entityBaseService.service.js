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
        }
    };
}