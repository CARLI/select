var test = require( './Entity/EntityInterface.spec' ) 
;

function validVendorData() {
    return {
        type: 'Vendor', 
        name: 'foo' 
    };
}

function invalidVendorData() {
    return {
        type: 'Vendor'
    };
}

test.run('Vendor', validVendorData, invalidVendorData);
