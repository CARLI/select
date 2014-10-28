var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , Store = require( '../../Store' )
  , MemoryStore = require('../../Store/MemoryStore')
;

/**
  * Type Name
  * Valid data
  * Invalid data
 */
function test( entityTypeName ) {

    var Entity = require('../../Entity/'+entityTypeName );

    describe( entityTypeName, function() {

        function validVendorData() {
          return { name: 'foo' };
        };

        it( 'should be a module', function() {
            expect(Entity).to.be.an('Object');
        } );

        it( 'should have a setStore function', function() {
            expect( Entity.setStore ).to.be.a( 'function' );
        } );

        Entity.setStore( Store( MemoryStore ) );

        it( 'should have a create function', function() {
            expect(Entity.create).to.be.a('function');
        } );

        describe( 'Vendor.create', function() {

            it( 'should fail without data', function() {
                function badSaveNoData(){
                    Entity.create();
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should return an object with an id', function() {
                expect( Entity.create( validVendorData() ) ).to.be.an('object').and.have.property('id');
            } );

            it( 'should return an object with type of "vendor"', function() {
                expect( Entity.create( validVendorData() ) ).to.have.property('type').to.equal('vendor');
            } );

            it( 'should use a new id for new objects', function() {
                var vendor1 = Entity.create( validVendorData() );
                var vendor2 = Entity.create( validVendorData() );
                expect( vendor1.id ).to.not.equal( vendor2.id );;
            } );

            it( 'should use an id if provided', function() {
                var vendorData = validVendorData();
                vendorData.id = 'foo';
                var vendor = Entity.create( vendorData );
                expect( vendor.id ).to.equal('foo');
            } );

        } );

        it( 'should have a load function', function() {
            expect(Entity.load).to.be.a('function');
        } );

        describe( 'Vendor.load', function() {
            it( 'should fail if no id string is provided', function() {
                function badLoadNoId() {
                    Entity.load();
                };
                expect( badLoadNoId ).to.throw( 'Id Required' );
            } );

            it( 'should return false if id not found', function() {
                expect( Entity.load( uuid.v4() ) ).to.be.false;
            } );

            it( 'should fail on an invalid schema', function() {
                function badVendorSchema() {
                  Entity.create( {} );
                };
                expect( badVendorSchema ).to.throw( 'Missing required property: name' );
            } );

            it( 'should return an object', function() {
                var vendor = Entity.create( validVendorData() );
                expect( Entity.load( vendor.id ) ).to.be.an('object');
            } );

            it( 'should return the object that was created', function() {
                var vendor_data = validVendorData();
                vendor_data.id = 'thingy';
                vendor_data.foo = 'bar'; 
                var vendor = Entity.create( vendor_data );
                vendor_data.type = 'vendor';
                expect( Entity.load( 'thingy' ) ).deep.equal( vendor_data );
            } );

        } );


        it( 'should have an update function', function() {
            expect(Entity.update).to.be.a('function');
        } );

        describe( 'Vendor.update', function(){
            it( 'should fail without data', function(){
                function badSaveNoData(){
                    Entity.update();
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should fail without an id in data', function(){
                function badSaveNoId(){
                    Entity.update({});
                }
                expect( badSaveNoId ).to.throw( 'Id Required' );
            } );

            it( "shouldn't have a false positive because of update with object reference bugs", function() {
                var vendor_data = validVendorData();
                vendor_data.foo = 'bar';
                var vendor = Entity.create( vendor_data );
                vendor.foo = 'new value';
                Entity.update( vendor );
                var storedVendor = Entity.load( vendor.id );
                vendor.foo = 'garbage';
                expect( storedVendor ).to.not.deep.equal( vendor );
            } );

            it( 'should update properties of a previously saved object', function(){
                var vendor_data = validVendorData();
                vendor_data.foo = 'bar';
                var vendor = Entity.create( vendor_data );
                vendor.foo = 'new value';
                Entity.update( vendor );
                expect( Entity.load( vendor.id ) ).to.deep.equal( vendor );
            } );

            it( 'should fail on update with invalid schema', function(){
                var vendor_data = validVendorData();
                vendor_data.foo = 'bar';
                var vendor = Entity.create( vendor_data );
                vendor.foo = 'new value';
                delete vendor.name;
                function updateBadVendor() {
                  Entity.update( vendor );
                }
                expect( updateBadVendor ).to.throw( 'Missing required property: name' );
            } );

        } );

        it( 'should have a list function', function() {
            expect(Entity.list).to.be.a('function');
        } );

        describe( 'Vendor.list', function(){
            it( 'should return an array', function() {
                expect( Entity.list() ).to.be.an('Array');
            } );

            // KLUDGE:  We really need to destroy all items and start over in each test
            //          group once we have a destroy();  THis is the number of items up to this point
            it( 'should return an array with 10 elements', function() {
                expect( Entity.list() ).to.be.an('Array').of.length( 10 );
            } );
        } );

    } );
    
}

module.exports = {
    run: test
}
