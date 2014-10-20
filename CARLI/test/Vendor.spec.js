var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , Vendor = require( '../Vendor' )
  , Store  = require( '../FixtureStore' )
;

describe( 'Vendor', function() {

    function validVendorData() {
      return { name: 'foo' };
    };

    it( 'should be a module', function() {
        expect(Vendor).to.be.an('Object');
    } );

    it( 'should have a setStore function', function() {
        expect( Vendor.setStore ).to.be.a( 'function' );
    } );

    Vendor.setStore( Store );

    it( 'should have a create function', function() {
        expect(Vendor.create).to.be.a('function');
    } );

    describe( 'Vendor.create', function() {

        it( 'should fail without data', function() {
            function badSaveNoData(){
                Vendor.create();
            }
            expect( badSaveNoData ).to.throw( 'Data Required' );
        } );

        it( 'should return an object with an id', function() {
            expect( Vendor.create( validVendorData() ) ).to.be.an('object').and.have.property('id');
        } );

        it( 'should return an object with type of "vendor"', function() {
            expect( Vendor.create( validVendorData() ) ).to.have.property('type').to.equal('vendor');
        } );

        it( 'should use a new id for new objects', function() {
            var vendor1 = Vendor.create( validVendorData() );
            var vendor2 = Vendor.create( validVendorData() );
            expect( vendor1.id ).to.not.equal( vendor2.id );;
        } );

        it( 'should use an id if provided', function() {
            var vendorData = validVendorData();
            vendorData.id = 'foo';
            var vendor = Vendor.create( vendorData );
            expect( vendor.id ).to.equal('foo');
        } );

    } );

    it( 'should have a load function', function() {
        expect(Vendor.load).to.be.a('function');
    } );

    describe( 'Vendor.load', function() {
        it( 'should fail if no id string is provided', function() {
            function badLoadNoId() {
                Vendor.load();
            };
            expect( badLoadNoId ).to.throw( 'Id Required' );
        } );

        it( 'should return false if id not found', function() {
            expect( Vendor.load( uuid.v4() ) ).to.be.false;
        } );

        it( 'should fail on an invalid schema', function() {
            function badVendorSchema() {
              Vendor.create( {} );
            };
            expect( badVendorSchema ).to.throw( 'Missing required property: name' );
        } );

        it( 'should return an object', function() {
            var vendor = Vendor.create( validVendorData() );
            expect( Vendor.load( vendor.id ) ).to.be.an('object');
        } );

        it( 'should return the object that was created', function() {
            var vendor_data = validVendorData();
            vendor_data.id = 'thingy';
            vendor_data.foo = 'bar'; 
            var vendor = Vendor.create( vendor_data );
            vendor_data.type = 'vendor';
            expect( Vendor.load( 'thingy' ) ).deep.equal( vendor_data );
        } );

    } );


    it( 'should have a update function', function() {
        expect(Vendor.update).to.be.a('function');
    } );

    describe( 'Vendor.update', function(){
        it( 'should fail without data', function(){
            function badSaveNoData(){
                Vendor.update();
            }
            expect( badSaveNoData ).to.throw( 'Data Required' );
        } );

        it( 'should fail without an id in data', function(){
            function badSaveNoId(){
                Vendor.update({});
            }
            expect( badSaveNoId ).to.throw( 'Id Required' );
        } );

        it( 'should update properties of a previously saved object', function(){
            var vendor_data = validVendorData();
            vendor_data.foo = 'bar';
            var vendor = Vendor.create( vendor_data );
            vendor.foo = 'new value';
            Vendor.update( vendor );

            expect( Vendor.load( vendor.id ) ).to.deep.equal( vendor );
        } );

        it( 'should fail on update with invalid schema', function(){
            var vendor_data = validVendorData();
            vendor_data.foo = 'bar';
            var vendor = Vendor.create( vendor_data );
            vendor.foo = 'new value';
            delete vendor.name;
            function updateBadVendor() {
              Vendor.update( vendor );
            }
            expect( updateBadVendor ).to.throw( 'Missing required property: name' );
        } );

    } );
} );
