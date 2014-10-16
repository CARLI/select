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

        function saveMissingIdProperty() {
            FixtureStore.save( { type: 'test'} );
        }
        it( 'should fail without an id property in the data', function() {
            expect( saveMissingIdProperty ).to.throw( /Requires id property/ );
        } );

        function saveMissingTypeProperty() {
            FixtureStore.save( { id: '0' } );
        }
        it( 'should fail without a type property in the data', function() {
            expect( saveMissingTypeProperty ).to.throw( /Requires type property/ );
        } );

        it( 'should save data and return id', function() {
            var id = uuid.v4();
            expect( FixtureStore.save( { id: id, type: 'testy' } ) ).to.equal( id );
        } );

    } );


    it( 'should have a get function', function() {
        expect(FixtureStore.get).to.be.a('function');        
    } );

    describe( 'FixtureStore.get', function() {

        function makeValidObject() {
            return {
                id:     uuid.v4(),
                type:   'testy'
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

        function badGetNoType(){
            FixtureStore.get({ id: 'foo' });
        }
        it( 'should fail without a type argument', function(){
           expect( badGetNoType ).to.throw( /Requires a type/ ); 
        } );

        function badGetIdNotFound() {
            FixtureStore.get( { id: uuid.v4(), type: 'testy' } );
        };
        it( 'should fail when an id not found', function() {
            expect( badGetIdNotFound ).to.throw( /Id not found/ );
        } );

        it( 'should return stored data for id', function() { 
            expect( FixtureStore.get( { id: simpleObjectSaveId, type: simpleObject.type } ) ).to.deep.equal( simpleObject );
        } );

        it( 'should save the data under id if id property is set', function() {
            expect( FixtureStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.deep.equal( objectWithId );
        } );

        it( 'should update the store if called with the same id', function(){
            objectWithId.foo = 'new value';
            FixtureStore.save( objectWithId );
            expect( FixtureStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.deep.equal( objectWithId );
        } );

        it('should save objects with differing types and same id separately', function(){
            var sharedId = uuid.v4();

            var objectWithType = makeValidObject();
            objectWithType.id = sharedId;

            var objectWithNewType = makeValidObject();
            objectWithNewType.type = 'new type';
            objectWithNewType.id = sharedId;

            FixtureStore.save( objectWithType );
            FixtureStore.save( objectWithNewType );

            expect( FixtureStore.get( { id: sharedId, type: objectWithType.type } ) ).to.deep.equal( objectWithType );
            expect( FixtureStore.get( { id: sharedId, type: objectWithNewType.type } ) ).to.deep.equal( objectWithNewType );
        } );
    } );
} );
