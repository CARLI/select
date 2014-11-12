var chai   = require( 'chai' )
  , expect = chai.expect
  , Validator = require( '../Validator' )
  , chaiAsPromised = require( 'chai-as-promised' )
;

chai.use( chaiAsPromised );

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

        it( 'should throw without a type in the data', function() {
            function badValidateNoType(){
                Validator.validate( {} );
            }
            expect( badValidateNoType ).to.throw( /Requires Type/i );
        });

        it( 'should throw for an unrecognized type', function() {
            function badValidateUnrecognizedType(){
                Validator.validate({
                    type: 'foobar'
                });
            }
            expect( badValidateUnrecognizedType ).to.throw( /Unrecognized Type/i );
        });

        it( 'should reject with a validation error for an invalid Vendor object', function() {
            return expect( Validator.validate( { type: 'Vendor' } ) ).to.be.rejectedWith( /Vendor validation error:/ );
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
            return expect( Validator.validate(validVendor) ).to.be.fullfilled
        });

        it( 'should throw a validation error for a Vendor object with an invalid websiteUrl', function() {
            return expect( Validator.validate({ type: 'Vendor', name: 'Example Vendor', websiteUrl: 'this is an invalid url' }) )
              .to.be.rejectedWith(/Vendor validation error:/ );
        });

        it( 'should return true for a Vendor object with a valid websiteUrl', function() {
            return expect( Validator.validate({ type: 'Vendor', name: 'Example Vendor', websiteUrl: 'http://www.examplevendor.com' }) )
              .to.be.fullfilled
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
