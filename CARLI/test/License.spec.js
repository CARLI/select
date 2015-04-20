var chai   = require( 'chai' )
    , expect = chai.expect
    , chaiAsPromised = require( 'chai-as-promised' )
    , VendorRepository = require('../Entity/VendorRepository' )
    , LicenseRepository = require('../Entity/LicenseRepository' )
    , uuid   = require( 'node-uuid' )
    , test = require( './Entity/EntityInterface.spec' )
    , testUtils = require('./utils')
    ;

chai.use( chaiAsPromised );
testUtils.setupTestDb();

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

describe('listLicensesForVendorId View', function(){

    it('should provide a listLicensesForVendorId method', function(){
       expect(LicenseRepository.listLicensesForVendorId).to.be.a('function');
    });

    var vendor1 = { id: uuid.v4(), type: "Vendor", name: "my vendor 1 name", isActive: true};
    var vendor2 = { id: uuid.v4(), type: "Vendor", name: "my vendor 2 name", isActive: true};
    var license1 = { id: uuid.v4(), type: "License", name: "my license 1 name", isActive: true, vendor: vendor1.id };
    var license2 = { id: uuid.v4(), type: "License", name: "my license 2 name", isActive: true, vendor: vendor1.id };
    var license3 = { id: uuid.v4(), type: "License", name: "my license 3 name", isActive: true, vendor: vendor2.id };
    var license4 = { id: uuid.v4(), type: "License", name: "my license 4 name", isActive: true, vendor: "bogus" };

    it('should return licenses associated with a vendor', function(){
        return LicenseRepository.create( license1 )
            .then( function() {
                return LicenseRepository.create( license2 );
            })
            .then (function () {
            return LicenseRepository.create( license3 );
            })
            .then (function () {
            return LicenseRepository.create( license4 );
            })
            .then(function(){
                return LicenseRepository.listLicensesForVendorId( vendor1.id );
            })
            .then(function ( licenseList ) {

                function verifyAllLicensesHaveVendor( licenseList ){
                    var match = true;
                    var vendorToMatch = vendor1;

                    licenseList.forEach(function( license ){
                        if ( license.vendor !== vendorToMatch.id ){
                            match = true;
                        }
                    });

                    return match;
                }

                return expect(licenseList).to.be.an('array').and.have.length(2).and.satisfy(verifyAllLicensesHaveVendor);
            });
    });
});

describe('Helper functions for getting Enum values from the License Schema', function(){

    it('should have a getOfferingTypeOptions function', function(){
        expect(LicenseRepository.getOfferingTypeOptions).to.be.a('function');
    });

    describe('the getOfferingTypeOptions function', function(){
        it('should return expected values', function(){
            var testData = [
                "Product",
                "Service",
                "Other"
            ];

            expect(LicenseRepository.getOfferingTypeOptions()).to.have.members(testData);
        });
    });
});
