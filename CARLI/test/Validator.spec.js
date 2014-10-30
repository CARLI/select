var chai   = require( 'chai' )
  , expect = chai.expect
  , Validator = require( '../Validator' )
;

var validTypes = [
    'Contact',
    'CycleType',
    'LicenseAgreement',
    'PriceCap',
    'Product',
    'Vendor',
    'WebAddress'
];

describe( 'The Validator Module', function() {

    it( 'should be a module', function() {
        expect( Validator ).to.be.an('Object');
    });

    it( 'should have a validate method', function() {
        expect( Validator.validate ).to.be.a('Function');
    });

    describe( 'Validator.validate', function() {
        it( 'should fail without data', function() {
            expect( Validator.validate ).to.throw( /Requires Data/i );
        });

        it( 'should fail without a type in the data', function() {
            function badValidateNoType(){
                Validator.validate( {} );
            }
            expect( badValidateNoType ).to.throw( /Requires Type/i );
        });

        it( 'should fail for an unrecognized type', function() {
            function badValidateUnrecognizedType(){
                Validator.validate({
                    type: 'foobar'
                });
            }
            expect( badValidateUnrecognizedType ).to.throw( /Unrecognized Type/i );
        });

        it( 'should return false for an invalid Vendor object', function() {
            var invalidVendor = {
                type: 'Vendor'
            };
            expect( Validator.validate(invalidVendor) ).to.be.false;
        });

        it( 'should return true for a valid Vendor object', function() {
            var validVendor = {
                type: 'Vendor',
                name: 'Example Vendor'
            };
            expect( Validator.validate(validVendor) ).to.be.true;
        });

        it( 'should return false for a Vendor object with an invalid websiteUrl', function() {
            var invalidVendor = {
                type: 'Vendor',
                name: 'Example Vendor',
                websiteUrl: 'this is an invalid url'
            };
            expect( Validator.validate(invalidVendor) ).to.be.false;
        });

        it( 'should return true for a Vendor object with a valid websiteUrl', function() {
            var invalidVendor = {
                type: 'Vendor',
                name: 'Example Vendor',
                websiteUrl: 'http://www.examplevendor.com'
            };
            expect( Validator.validate(invalidVendor) ).to.be.true;
        });
    });

    it( 'should have a list method', function() {
        expect( Validator.list ).to.be.a('Function');
    });

    describe( 'Validator.list', function() {
        it( 'should return an array', function() {
            expect( Validator.list() ).to.be.an('Array');
        });

        it( 'should return the valid types', function() {
            expect( Validator.list() ).to.have.members( validTypes );
        });
    });

});
