var test = require( './Entity/EntityInterface.spec' ) 
;

function validVendorData() {
  return { name: 'foo' };
};

test.run('Vendor', validVendorData);
