var couchapp = require( 'couchapp' )
  , path = require( 'path' );

ddoc = {
    _id: '_design/CARLI',
    language: "javascript",
    validate_doc_update_disabled: function (newDoc, oldDoc, userCtx) {
        if ( ! (userHasRole('staff') || userHasRole('_admin')) ) {
            throw({ forbidden: 'Unauthorized' });
        }

        if ( newDoc.password && userCtx.name !== oldDoc.name ) {
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
        listUsersByEmail: {
            map: function (doc) {
                if ( doc.type === 'user' ) {
                    emit (doc.email, doc)
                }
            }
        }
    }
};

module.exports = ddoc;
