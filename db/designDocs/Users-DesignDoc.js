var couchapp = require( 'couchapp' )
  , path = require( 'path' );

ddoc = {
    _id: '_design/CARLI',
    language: "javascript",
    validate_doc_update_disabled: function (newDoc, oldDoc, userCtx) {
        if (userHasRole('_admin'))
            return;

        if (passwordUpdated() && !currentUserCanChangePassword())
            throw({ forbidden: 'Unauthorized' });

        if (rolesWereChanged())
            throw({ forbidden: 'Unauthorized' });

        if (userHasRole('staff'))
            return;

        // TODO: if user is vendor, check that the document being edited is the same vendor
        // TODO: if user is library, check that they have write permission, and check that the document is the same library

        function userHasRole(role) {
            return userCtx.roles.indexOf(role) >= 0;
        }
        function passwordUpdated() {
            return typeof newDoc.password !== 'undefined';
        }
        function currentUserCanChangePassword() {
            return userCtx._id !== newDoc._id;
        }
        function rolesWereChanged() {
            return toJSON(newDoc.roles) != toJSON(oldDoc.roles);
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
