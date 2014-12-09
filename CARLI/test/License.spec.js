var test = require( './Entity/EntityInterface.spec' ) 
;

function validLicenseData() {
    return {
        type: 'License',
        name: 'foo',
	vendor: 'vendor1'
    };
};
function invalidLicenseData() {
    return {
        type: 'License'
    };
};

test.run('License', validLicenseData, invalidLicenseData);

