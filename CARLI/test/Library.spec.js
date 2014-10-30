var test = require( './Entity/EntityInterface.spec' ) 
;

function validLibraryData() {
    return {
        type: 'Library',
        name: 'foo' 
    };
};
function invalidLibraryData() {
    return {
        type: 'Library'
    };
};

test.run('Library', validLibraryData, invalidLibraryData);

