
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
    _transformObjectsToReferences(entity, propertiesToTransform);
}

function _transformObjectsToReferences(entity, propertiesToTransform) {
    for (var property in propertiesToTransform) {
        if (_isNonNullObject(entity, property)) {
            entity[property] = entity[property].id;
        }
    }
}

function _isNonNullObject(entity, prop) {
    return (entity[prop] && typeof entity[prop] === 'object');
}

module.exports = {
    removeEmptyContactsFromEntity: removeEmptyContactsFromEntity,
    transformObjectForPersistence: transformObjectForPersistence
};