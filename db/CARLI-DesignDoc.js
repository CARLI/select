var couchapp = require( 'couchapp' )
  , path = require( 'path' );

ddoc = {
    _id: '_design/CARLI',
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
        listOfferingsForProductId: {
            map: function ( doc ) {
                if ( doc.type === 'Offering' ) {
                    emit( doc.product, doc );
                }
            }
        },
        listProductsByLicenseId: {
            map: function ( doc ) {
                if ( doc.type === 'Product' ) {
                    emit( doc.license, doc );
                }
            }
        },
        listProductsForVendorId: {
            map: function ( doc ) {
                if ( doc.type === 'Product' ) {
                    emit( doc.vendor, doc );
                }
            }
        },
        listLicensesForVendorId: {
            map: function ( doc ) {
                if ( doc.type === 'License' ) {
                    emit( doc.vendor, doc );
                }
            }
        }
    }
};

module.exports = ddoc;
