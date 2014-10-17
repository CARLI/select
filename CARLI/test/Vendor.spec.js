var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , Vendor = require( '../Vendor' )
  , Store  = require( '../FixtureStore' )
;

describe( 'Vendor', function() {

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

        function createEmptyVendor(data) {
            return Vendor.create(data);
        };

        it( 'should return an object with an id', function() {
            expect(createEmptyVendor({})).to.be.an('object').and.have.property('id');
        } );

        it( 'should return an object with type of "vendor"', function() {
            expect(createEmptyVendor({})).to.have.property('type').to.equal('vendor');
        } );

        it( 'should use a new id for new objects', function() {
            var vendor1 = Vendor.create({});
            var vendor2 = Vendor.create({});
            expect( vendor1.id ).to.not.equal( vendor2.id );;
        } );

        it( 'should use an id if provided', function() {
            var vendor = Vendor.create( {id: 'foo'} );
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

        it( 'should return an object', function() {
            var vendor = Vendor.create({}); 
            expect( Vendor.load( vendor.id ) ).to.be.an('object');
        } );

        it( 'should return the object that was created', function() {
            var vendor_data = { id: 'thingy', foo: 'bar' };
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
/*
        it('should update properties of a previously saved object', function(){
            var vendor = Vendor.create({ foo: 'bar' });

            //This is because FixtureStore saves a reference so if we modify vendor here it modifies it there too
            var copyOfVendor = {
                id: vendor.id,
                type: vendor.type,
                foo: vendor.foo
            };

            vendor.foo = 'new value';
            Vendor.update( vendor );

            expect( Vendor.load( vendor.id ) ).to.deep.equal( copyOfVendor );
        } );
*/
    } );
} );
