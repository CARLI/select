var test = require( './Entity/EntityInterface.spec' ) 
;

function validLicenseData() {
    return {
        type: 'License',
        name: 'foo' 
    };
};
function invalidLicenseData() {
    return {
        type: 'License'
    };
};

test.run('License', validLicenseData, invalidLicenseData);

