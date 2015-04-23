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
        listOfferingsForProductId: {
            map: function ( doc ) {
                if ( doc.type === 'Offering' ) {
                    emit( doc.product, doc );
                }
            }
        },
        listOfferingsForLibraryId: {
            map: function ( doc ) {
                if ( doc.type === 'Offering' ) {
                    emit( doc.library, doc );
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
        listOfferingsWithSelections: {
            map: function ( doc ) {
                if ( doc.type === 'Offering' && doc.selection ) {
                    emit( doc.id, doc );
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
        listProductCountsByVendorId: {
            map: function(doc) {
                if (doc.type === 'Product') {
                    emit(doc.vendor, 1);
                }
            },
            reduce: function(key, values) {
                return sum(values);
            }
        },
        listLibrariesWithSelections: {
            map: function(doc) {
                if (doc.type === 'Offering' && doc.selection ) {
                    emit(doc.library, 1);
                }
            },
            reduce: function(key, values) {
                return sum(values);
            }
        },
        getCycleSelectionAndInvoiceTotals: {
            map: function(doc) {
                if (doc.type == 'Offering') {
                    selectionPrice = doc.selection ? doc.selection.price : 0;
                    invoicePrice = doc.invoice ? doc.invoice.price || 0 : 0;

                    emit(null, {
                        selectionPrice: selectionPrice,
                        invoicePrice: invoicePrice
                    });
                }
            },
            reduce: function(key, values, rereduce) {
                var selectionPrices = values.map(function (v) { return v.selectionPrice; });
                var invoicePrices = values.map(function (v) { return v.invoicePrice; });

                return {
                    selectionPrice: sum(selectionPrices),
                    invoicePrice: sum(invoicePrices)
                };
            }
        }
    },
    filters: {
        filterCycleDatabaseForVendor: function(doc, req) {
            if(!req.query.vendorId) {
                throw("vendorId is required");
            }

            if (doc.vendor == req.query.vendorId || doc.vendorId == req.query.vendorId) {
                return true;
            }

            if (doc._id.substr(0, 7) === '_design') {
                return true;
            }

            return false;
        }
    }
};

module.exports = ddoc;
