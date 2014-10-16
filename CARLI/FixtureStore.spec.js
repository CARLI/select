var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
;

describe( 'FixtureStore', function() {
    var FixtureStore = require( './FixtureStore' );

    it( 'should be a module', function() {
        expect(FixtureStore).to.be.an('object');
    } );


    it( 'should have a save function', function() {
        expect(FixtureStore.save).to.be.a('function');        
    } );

    describe( 'FixtureStore.save', function() {

        it( 'should fail without data', function() {
            expect( FixtureStore.save ).to.throw( /Requires Data/ );
        } );

        function saveMissingTypeProperty() {
            FixtureStore.save( {} );
        }
        it( 'should fail without a type property in the data', function() {
            expect( saveMissingTypeProperty ).to.throw( /Requires type property/ );
        } );

        it( 'should save data and return id', function() {
            expect( FixtureStore.save( { type: 'testy' } ) ).to.be.a('string');
        } );

    } );


    it( 'should have a get function', function() {
        expect(FixtureStore.get).to.be.a('function');        
    } );

    describe( 'FixtureStore.get', function() {

        function makeValidObject() {
            return {
                type: 'testy'
            }
        };

        var simpleObject = makeValidObject();
        simpleObject.foo = 'bar';
        var simpleObjectSaveId  = FixtureStore.save( simpleObject );

        var objectWithId = makeValidObject();
        objectWithId.id = uuid.v4();
        objectWithId.foo = 'baz';
        var objectWithIdSaveId  = FixtureStore.save( objectWithId );

        it( 'should fail without an id', function() {
            expect( FixtureStore.get ).to.throw( /Requires an id/ );
        } );

        function badGet() {
            FixtureStore.get( uuid.v4() );
        };

        it( 'should fail when an id not found', function() {
            expect( badGet ).to.throw( /Id not found/ );
        } );

        it( 'should return stored data for id', function() { 
            expect( FixtureStore.get( simpleObjectSaveId ) ).to.deep.equal( simpleObject );
        } );

        it( 'should save the data under id if id property is set', function() {
            expect( FixtureStore.get( objectWithIdSaveId ) ).to.deep.equal( objectWithId );
        } );

        it( 'should update the store if called with the same id', function(){
            objectWithId.foo = 'new value';
            FixtureStore.save( objectWithId );
            expect( FixtureStore.get( objectWithIdSaveId ) ).to.deep.equal( objectWithId );
        } );

    } );
} );
