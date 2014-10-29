var test = require( './Entity/EntityInterface.spec' ) 
;

function validLibraryData() {
  return { name: 'foo' };
};
function invalidLibraryData() {
  return { };
};

test.run('Library', validLibraryData, invalidLibraryData);

