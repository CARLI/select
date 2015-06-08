var couchapp = require( 'couchapp' )
  , path = require( 'path' );

ddoc = {
    _id: '_design/CARLI',
    language: "javascript",
    validate_doc_update_disabled: function (newDoc, oldDoc, userCtx) {
        if ( ! (userHasRole('staff') || userHasRole('_admin')) ) {
            throw({ forbidden: 'Unauthorized' });
        }

        function userHasRole(role) {
            return userCtx.roles.indexOf(role) >= 0;
        }
    },
    views: {
        listByType: {
            map: function( doc ) { if ( doc.type ) { emit( doc.type, doc ) } }
        },
        docTypes: {
            map: function( doc ) { if ( doc.type ) { emit( doc.type, doc ) } },
            reduce: function( key, values ) { emit( null ); }
        },
        listRequestsByResetKey: {
            map: function (doc) {
                if ( doc.type === 'user-reset-request' && resetKeyIsNotExpired(doc) ) {
                    emit (doc.key, doc);
                }

                function resetKeyIsNotExpired(resetRequest) {
                    var oneDayInMilliseconds = 86400000;
                    var keyGeneratedMilliseconds = new Date(resetRequest.date).getTime();

                    return Date.now() - keyGeneratedMilliseconds <= oneDayInMilliseconds;
                }
            }
        },
        listExpiredRequestIds: {
            map: function (doc) {
                if ( doc.type === 'userResetRequest' && resetKeyIsExpired(doc) ) {
                    emit (doc._id, null);
                }

                function resetKeyIsExpired(resetRequest) {
                    var oneDayInMilliseconds = 86400000;
                    var keyGeneratedMilliseconds = new Date(resetRequest.date).getTime();

                    return Date.now() - keyGeneratedMilliseconds > oneDayInMilliseconds;
                }
            }
        }
    }
};

module.exports = ddoc;
