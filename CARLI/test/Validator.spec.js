var chai   = require( 'chai' )
  , expect = chai.expect
  , Validator = require( '../Validator' )
;

var validTypes = [
    'Contact',
    'CycleType',
    'Library',
    'License',
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

        it( 'should throw a validation error for an invalid Vendor object', function() {
            function badValidateInvalidData(){
                Validator.validate({
                    type: 'Vendor'
                });
            }
            expect( badValidateInvalidData ).to.throw( /ValidationError/i );
        });

        it( 'should return true for a valid Vendor object', function() {
            var validVendor = {
                type: 'Vendor',
                name: 'Example Vendor',
                contacts: [{
                    contactType: 'Billing',
                    name: 'George',
                    email: 'george@jetson.com',
                    phoneNumber: '123-4567'
                }]
            };
            expect( Validator.validate(validVendor) ).to.be.true;
        });

        it( 'should throw a validation error for a Vendor object with an invalid websiteUrl', function() {
            function badValidateInvalidWebsiteUrl(){
                Validator.validate({
                    type: 'Vendor',
                    name: 'Example Vendor',
                    websiteUrl: 'this is an invalid url'
                });
            }
            expect( badValidateInvalidWebsiteUrl ).to.throw( /ValidationError/i );
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
