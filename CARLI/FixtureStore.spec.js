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

        it( 'should save data and return id', function() {
            expect( FixtureStore.save( {} ) ).to.be.a('string');
        } );

    } );

    it( 'should have a get function', function() {
        expect(FixtureStore.get).to.be.a('function');        
    } );

    describe( 'FixtureStore.get', function() {
        var emptyObjectSaveId = FixtureStore.save( {} );
        var simpleObjectSaveId = FixtureStore.save( {foo:'bar'} );
        var objectWithIdSaveId = FixtureStore.save( { id: uuid.v4(), foo: 'baz' } );

        it( 'should fail without an id', function() {
            expect( FixtureStore.get ).to.throw( /Requires an id/ );
        } );

        function badGet() {
            FixtureStore.get( uuid.v4() );
        };

        it( 'should fail when an id not found', function() {
            expect( badGet ).to.throw( /Id not found/ );
        } );

        it( 'should return previously stored data', function() {
            expect( FixtureStore.get( emptyObjectSaveId ) ).to.be.an('object');
        } );

        it( 'should return specific data for id2', function() {
            expect( FixtureStore.get( simpleObjectSaveId ) ).to.deep.equal( {foo:'bar'} );
        } );

        it( 'should save the data under id if id property is set', function() {
            expect( FixtureStore.get( objectWithIdSaveId ) ).to.deep.equal( { id: objectWithIdSaveId,foo: 'baz' } );
        } );

        it( 'should update the store if called with the same id', function(){
            var newObj = { id: objectWithIdSaveId, foo: 'somejunk' };
            FixtureStore.save( newObj );
            expect( FixtureStore.get( objectWithIdSaveId ) ).to.deep.equal( newObj );
        } );


    } );
} );
