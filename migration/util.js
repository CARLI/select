/**
 * In the IDAL database products are normalized, so if one product is offered by multiple vendors there is still only
 * one product row. In order to make them unique products in the new selection system we need a unique identifier for
 * each vendor + product combination. These are used throughout the migration in place of the simple product_id.
 */
module.exports = {
    makeUniqueProductIdFromDatabaseRow: makeUniqueProductIdFromDatabaseRow,
    makeProductLegacyId: makeProductLegacyId
};

function makeUniqueProductIdFromDatabaseRow( row ){
    return makeProductLegacyId( row.vendor_id, row.product_id);
}

function makeProductLegacyId(vendorLegacyId, productLegacyId){
    return vendorLegacyId+'_'+productLegacyId;
}