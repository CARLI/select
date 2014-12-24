var uuid = require('node-uuid');

var vendor_uuid = uuid.v4();
var license_uuid = uuid.v4();

var vendor = {
    id: vendor_uuid,
    name: 'Product E2E Test Vendor'
};
var license = {
    id: license_uuid,
    name: 'Product E2E Test License',
    vendor: vendor_uuid
};

module.exports = {
    vendor: vendor,
    license: license
};