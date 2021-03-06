/**
 * List all conflicts in a database.
 */

ddoc = {
    _id: '_design/ListConflicts',
    views: {
        listConflicts: {
            map: function(doc) {
                if (doc._conflicts) {
                    emit(null, [doc._rev].concat(doc._conflicts));
                }
            }
        }
    }
};

module.exports = ddoc;
