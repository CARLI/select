var chai   = require( 'chai' )
    , expect = chai.expect
    , chaiAsPromised = require( 'chai-as-promised' )
    , VendorRepository = require('../Entity/VendorRepository' )
    , LicenseRepository = require('../Entity/LicenseRepository' )
    , uuid   = require( 'node-uuid' )
    , test = require( './Entity/EntityInterface.spec' )
;

chai.use( chaiAsPromised );

function validLicenseData() {
    return {
        type: 'License',
        name: 'foo',
	vendor: 'vendor1'
    };
}

function invalidLicenseData() {
    return {
        type: 'License'
    };
}

test.run('License', validLicenseData, invalidLicenseData);


describe('Converting referenced entities', function() {

    //The Repository should store references to sub-Entities as their ID, not the whole object
    describe('Stripping referenced entities on create/update', function() {
        //we can't test this without looking at the Store directly
        it('should convert objects to id');
    });

    describe('Expanding referenced entities on load', function() {

        var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name"};

        it('should expand references to vendors in Licenses', function () {
            var license = validLicenseData();
            license.vendor = vendor;

            return VendorRepository.create(vendor)
                .then(function () {
                    return LicenseRepository.create(license);
                })
                .then(function (licensetId) {
                    return LicenseRepository.load(licensetId);
                })
                .then(function ( testLicense ) {
                    return expect(testLicense.vendor).to.be.an('object').and.have.property('name');
                });
        });
    });
});