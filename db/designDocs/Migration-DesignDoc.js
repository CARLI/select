/**
 * Used for mapping offerings from past cycles to later cycles in order to get historical pricing.
 */

ddoc = {
    _id: '_design/Migration',
    views: {
        listOfferingsByLibraryAndProduct: {
            map: function ( doc ) {
                if ( doc.type === 'Offering' ) {
                    emit( [doc.library,doc.product], doc );
                }
            }
        }
    }
};

module.exports = ddoc;
