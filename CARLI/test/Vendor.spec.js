var test = require( './Entity/EntityInterface.spec' ) 
;

function validVendorData() {
  return { name: 'foo' };
};
function invalidVendorData() {
  return { };
};

test.run('Vendor', validVendorData, invalidVendorData);
