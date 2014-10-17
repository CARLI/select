var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
;

function test( storeType ) {
    describe( storeType, function() {
        var DataStore = require( '../' + storeType );
    
        it( 'should be a module', function() {
            expect(DataStore).to.be.an('object');
        } );
    
    
        it( 'should have a save function', function() {
            expect(DataStore.save).to.be.a('function'); 
        } );
    
        describe( storeType + '.save', function() {
    
            it( 'should fail without data', function() {
                expect( DataStore.save ).to.throw( /Requires Data/ );
            } );
    
            function saveMissingIdProperty() {
                DataStore.save( { type: 'test'} );
            }
            it( 'should fail without an id property in the data', function() {
                expect( saveMissingIdProperty ).to.throw( /Requires id property/ );
            } );
    
            function saveMissingTypeProperty() {
                DataStore.save( { id: '0' } );
            }
            it( 'should fail without a type property in the data', function() {
                expect( saveMissingTypeProperty ).to.throw( /Requires type property/ );
            } );
 
            it( 'should save data and return id', function() {
                var id = uuid.v4();
                expect( DataStore.save( { id: id, type: 'testy' } ) ).to.equal( id );
            } );
 
        } );
    
    
        it( 'should have a get function', function() {
            expect(DataStore.get).to.be.a('function');        
        } );
    
        describe( storeType + '.get', function() {
    
            function makeValidObject() {
                return {
                    id:     uuid.v4(),
                    type:   'testy'
                }
            };
    
            var simpleObject = makeValidObject();
            simpleObject.foo = 'bar';
            var simpleObjectSaveId  = DataStore.save( simpleObject );
    
            var objectWithId = makeValidObject();
            objectWithId.id = uuid.v4();
            objectWithId.foo = 'baz';
            var objectWithIdSaveId  = DataStore.save( objectWithId );
    
            it( 'should fail without an id', function() {
                expect( DataStore.get ).to.throw( /Requires an id/ );
            } );
 
            function badGetNoType(){
                DataStore.get({ id: 'foo' });
            }
            it( 'should fail without a type argument', function(){
               expect( badGetNoType ).to.throw( /Requires a type/ );
            } );
   
            function badGetTypeNotInStore(){
                DataStore.get({ id: uuid.v4(), type: uuid.v4() });
            }
            it( 'should fail when the type is not in the store', function() {
                expect( badGetTypeNotInStore ).to.throw( /Type not found/ );
            } ); 

            function badGetIdNotFound() {
                DataStore.get( { id: uuid.v4(), type: 'testy' } );
            };
            it( 'should fail when an id not found', function() {
                expect( badGetIdNotFound ).to.throw( /Id not found/ );
            } );
    
            it( 'should return stored data for id', function() { 
                expect( DataStore.get( { id: simpleObjectSaveId, type: simpleObject.type } ) ).to.deep.equal( simpleObject );
            } );
 
            it( 'should save the data under id if id property is set', function() {
                expect( DataStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.deep.equal( objectWithId );
            } );

            it( 'should update the store if called with the same id', function(){
                objectWithId.foo = 'new value';
                DataStore.save( objectWithId );
                expect( DataStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.deep.equal( objectWithId );
            } );

            it('should save objects with differing types and same id separately', function(){
                var sharedId = uuid.v4();
    
                var objectWithType = makeValidObject();
                objectWithType.id = sharedId;
    
                var objectWithNewType = makeValidObject();
                objectWithNewType.type = 'new_type';
                objectWithNewType.id = sharedId;
    
                DataStore.save( objectWithType );
                DataStore.save( objectWithNewType );
    
                expect( DataStore.get( { id: sharedId, type: objectWithType.type } ) ).to.deep.equal( objectWithType );
                expect( DataStore.get( { id: sharedId, type: objectWithNewType.type } ) ).to.deep.equal( objectWithNewType );
            } );
        } );
    } );
}

module.exports = {
    run: test
}
