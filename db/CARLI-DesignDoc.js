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
        listActiveCycles: {
            map: function ( doc ) {
                if (doc.type === 'Cycle' && !doc.isArchived) {
                    emit(doc.id, doc);
                }
            }
        },
        listLicensesForVendorId: {
            map: function ( doc ) {
                if ( doc.type === 'License' ) {
                    emit( doc.vendor, doc );
                }
            }
        },
        loadNonCrmLibraryForCrmId: {
            map: function( doc ) {
                if ( doc.type === 'LibraryNonCrm' ){
                    emit( doc.crmId, doc );
                }
            }
        },
        listSentNotificationsByDate: {
            map: function( doc ) {
                if ( doc.type === 'Notification' && doc.draftStatus === "sent" ) {
                    emit( doc.dateSent, doc );
                }
            }
        },
        listUsersByResetKey: {
            map: function (doc) {
                if ( doc.type === 'user' && userHasUnexpiredResetKey(doc) ) {
                    emit (doc.passwordResetDate, doc)
                }

                function userHasUnexpiredResetKey(user) {
                    if (!user.passwordResetDate || !user.passwordResetDate) {
                        return false;
                    }

                    var oneDayInMilliseconds = 86400000;
                    var keyGeneratedMilliseconds = new Date(user.passwordResetDate).getTime();

                    return Date.now() - keyGeneratedMilliseconds < oneDayInMilliseconds;
                }
            }
        }
    }
};

module.exports = ddoc;
