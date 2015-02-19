var chai   = require( 'chai' )
  , expect = chai.expect
  , Validator = require( '../Validator' )
  , chaiAsPromised = require( 'chai-as-promised' )
;

chai.use( chaiAsPromised );

var validTypes = [
    'Contact',
    'Cycle',
    'CycleType',
    'Date',
    'InstitutionType',
    'InstitutionYears',
    'Library',
    'LibraryNonCrm',
    'License',
    'MembershipLevel',
    'Offering',
    'PriceCap',
    'Pricing',
    'Product',
    'ProductDetailCodes',
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
            return expect( Validator.validate( { type: 'Vendor' } ) ).to.be.rejectedWith( /Missing required property:/ );
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

        it.skip( 'should throw a validation error for a Vendor object with an invalid websiteUrl', function() {
            return expect( Validator.validate({ type: 'Vendor', name: 'Example Vendor', websiteUrl: 'this is an invalid url' }) )
              .to.be.rejectedWith(/Missing required property:/ );
        });

        it( 'should return true for a Vendor object with a valid websiteUrl', function() {
            return expect( Validator.validate({ type: 'Vendor', name: 'Example Vendor', websiteUrl: 'http://www.examplevendor.com' }) )
              .to.be.fullfilled
        });

        it( 'should throw a validation error for a Product without a Vendor reference', function() {
            return expect(Validator.validate({ type: 'Product', name: 'Test Product' }))
                .to.be.rejectedWith(/Missing required property:/);
        });

        it( 'should throw a validation error for a One-Time Purchase Product with a non-integer Annual Access Fee', function() {
            var testProduct = {
                type: "Product",
                name: "Test Product",
                cycle: 'my-cycle-id',
                vendor: 'my-vendor-id',
                oneTimePurchase: {
                    annualAccessFee: "bad value"
                }
            };

            return expect( Validator.validate(testProduct) ).to.be.rejectedWith(/Invalid type: string \(expected number\)/ );
        });

        it( 'should throw a validation error for a One-Time Purchase Product with a non-integer Library price', function() {
            var testProduct = {
                type: "Product",
                name: "Test Product",
                cycle: 'my-cycle-id',
                vendor: 'my-vendor-id',
                oneTimePurchase: {
                    libraryPurchaseData: {
                        'id': {
                            price: "ffff123"
                        }
                    }
                }
            };

            return expect( Validator.validate(testProduct) ).to.be.rejectedWith(/Invalid type: string \(expected number\)/ );
        });

        it( 'should fail for an invalid Library Institution Type', function(){
            var testLibrary = {
                type: 'Library',
                name: 'Test Library',
                institutionType: 'A Clearly Invalid Institution Type' 
            };

            return expect( Validator.validate(testLibrary) ).to.be.rejectedWith(/No enum match for/);
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

    it( 'should have a getEnumValuesFor function', function() {
        expect( Validator.getEnumValuesFor ).to.be.a('function');
    });

    describe( 'Validator.getEnumValuesFor', function(){
        it( 'should fail without a type', function(){
            function badDataNoType(){
                Validator.getEnumValuesFor();
            }

            expect( badDataNoType ).to.throw(/Type Required/);
        });

        it( 'should fail for an unknown schema type', function(){
            function badDataUnknownType(){
                Validator.getEnumValuesFor('Unknown Type');
            }

            expect( badDataUnknownType ).to.throw(/Unknown Type/);
        });

        it( 'should fail without a property name if the schema type is not an enum', function(){
            function badDataNoProperty(){
                Validator.getEnumValuesFor( 'Product' );
            }

            expect( badDataNoProperty ).to.throw(/Property Required/);
        });

        it( 'should return enum values for a schema type that is an enum', function(){
            var expectedValues = [
                "Private",
                "Public",
                "Other"
            ];

            expect( Validator.getEnumValuesFor('InstitutionType') ).to.have.members( expectedValues );
        });

        it( 'should return expected values for an enum property of a schema', function(){
            var expectedValues = [
                "Billing",
                "Sales",
                "Technical",
                "Director",
                "E-Resources Liaison",
                "Other",
                "Notification Only"
            ];

            expect( Validator.getEnumValuesFor('Contact', 'contactType') ).to.have.members( expectedValues );
        });
    });

    it( 'should have a listNonIdPropertiesFor function', function() {
        expect( Validator.listNonIdPropertiesFor ).to.be.a('function');
    });

    describe( 'Validator.listNonIdPropertiesFor', function() {
        it('should return an array of properties', function(){
            expect( Validator.listNonIdPropertiesFor('LibraryNonCrm')).to.be.an('array');
        });

        it('should return the expected list of properties', function(){
            var expectedValues = [
                'crmId',
                'ipAddresses'
            ];
            expect( Validator.listNonIdPropertiesFor('LibraryNonCrm')).to.have.members( expectedValues );
        });
    });

});
