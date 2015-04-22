var couchapp = require( 'couchapp' )
  , path = require( 'path' );

ddoc = {
    _id: '_design/CARLI',
    language: "javascript",
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
        }
    }
};

module.exports = ddoc;
