var couchapp = require( 'couchapp' )
  , path = require( 'path' );

ddoc = {
    _id: '_design/CARLI',
    filters: {
        filterCycleDatabaseForVendor: function(doc, req) {
            if(!req.query.vendorId) {
                throw("vendorId is required");
            }

            if (doc.vendor == req.query.vendorId || doc.vendorId == req.query.vendorId) {
                return true;
            }

            if (doc._id === '_design/CARLI') {
                return true;
            }

            return false;
        }
    },
    validate_doc_update_disabled: function (newDoc, oldDoc, userCtx) {
        if ( ! (userHasRole('staff') || userHasRole('_admin') || userHasMatchingVendorRole()) ) {
            throw({ forbidden: 'Unauthorized' });
        }

        function userHasRole(role) {
            return userCtx.roles.indexOf(role) >= 0;
        }

        function userHasMatchingVendorRole() {
            var vendorId = userCtx.db.slice(-36);
            return userHasRole('vendor') && userHasRole('vendor-' + vendorId);
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
                    emit( doc.library, doc );
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
        listVendorStatusesByVendorId: {
            map: function(doc) {
                if ( doc.type === 'VendorStatus' ){
                    emit(doc.vendor, doc);
                }
            }
        },
        listLibraryStatusesByLibraryId: {
            map: function(doc) {
                if ( doc.type === 'LibraryStatus' ){
                    emit(doc.library, doc);
                }
            }
        },
        getCycleSelectionAndInvoiceTotals: {
            map: function(doc) {
                if (doc.type == 'Offering') {
                    var selectionPrice = doc.selection ? doc.selection.price : 0;
                    var vendorInvoicePrice = doc.invoice ? doc.invoice.price || 0 : 0;

                    if (doc.funding) {
                        if (doc.funding.fundedByPercentage) {
                            if (doc.funding.fundedPercent > 0) {
                                selectionPrice = selectionPrice - (doc.funding.fundedPercent * selectionPrice);
                            }
                        } else {
                            if (doc.funding.fundedPrice > 0) {
                                selectionPrice = doc.funding.fundedPrice;
                            }
                        }
                    }

                    emit(null, {
                        selectionPrice: selectionPrice,
                        invoicePrice: vendorInvoicePrice
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
    }
};

module.exports = ddoc;
