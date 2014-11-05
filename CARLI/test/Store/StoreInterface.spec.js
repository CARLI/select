var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , store = require( '../../Store' )
  , chaiAsPromised = require( 'chai-as-promised' )
  , Q     = require( 'q' )
;

chai.use( chaiAsPromised );

function test( storeTypeName, options ) {

    var storeType = require('../../Store/'+storeTypeName )( options );

    function makeValidObject() {
        return {
            id:     uuid.v4(),
            type:   'testy'
        }
    };

    describe( storeTypeName, function() {
        var DataStore = store( storeType );

        it( 'should be a module', function() {
            expect(DataStore).to.be.an('object');
        } );


        it( 'should have a save function', function() {
            expect(DataStore.save).to.be.a('function');
        } );

        describe( storeTypeName + '.save', function() {

            it( 'should fail without data', function() {
                expect( DataStore.save ).to.throw( /Requires Data/ );
            } );

            it( 'should fail without an id property in the data', function() {
                function saveMissingIdProperty() {
                    DataStore.save( { type: 'test'} );
                }
                expect( saveMissingIdProperty ).to.throw( /Requires id property/ );
            } );

            it( 'should fail without a type property in the data', function() {
                function saveMissingTypeProperty() {
                    DataStore.save( { id: '0' } );
                }
                expect( saveMissingTypeProperty ).to.throw( /Requires type property/ );
            } );

            it( 'should save data and return id', function() {
                var id = uuid.v4();
                expect( DataStore.save( { id: id, type: 'testy' } ) ).to.eventually.equal( id );
            } );

        } );


        it( 'should have a get function', function() {
            expect(DataStore.get).to.be.a('function');
        } );

        describe( storeTypeName + '.get', function() {

            var simpleObject = makeValidObject();
            simpleObject.foo = 'bar';
            var simpleObjectSaveId  = null;



            var objectWithId = makeValidObject();
            objectWithId.id = uuid.v4();
            objectWithId.foo = 'baz';
            var objectWithIdSaveId  = null;

            before( function( done ) {
                Q.all([
                    DataStore.save( simpleObject ),
                    DataStore.save( objectWithId )
                ]).then( function( ids ) {
                    simpleObjectSaveId = ids[0];
                    objectWithIdSaveId = ids[1];
                    done();
                } );
            } );

            it( 'should fail without an id', function() {
                expect( DataStore.get ).to.throw( /Requires an id/ );
            } );

            function badGetNoType(){
                DataStore.get({ id: 'foo' });
            }

            it( 'should fail without a type argument', function(){
               expect( badGetNoType ).to.throw( /Requires a type/ );
            } );

            it( 'should fail when the type is not in the store', function() {
                return expect( DataStore.get({ id: uuid.v4(), type: uuid.v4() })).to.be.rejectedWith( /Type not found/ );
            } );

            it( 'should fail when an id not found', function() {
                return expect( DataStore.get( { id: uuid.v4(), type: 'testy' } )).to.be.rejectedWith( /Id not found/ );
            } );

            it( 'should return stored data for id', function() {
                return expect( DataStore.get( { id: simpleObjectSaveId, type: simpleObject.type } ) ).to.eventually.deep.equal( simpleObject );
            } );

            it( 'should save the data under id if id property is set', function() {
                return expect( DataStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.eventually.deep.equal( objectWithId );
            } );

            it( 'should update the store if called with the same id', function(){
                objectWithId.foo = 'new value';
                DataStore.save( objectWithId );
                expect( DataStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.eventually.deep.equal( objectWithId );
            } );

            it( "shouldn't update the store because of an object reference bug", function() {
                DataStore.save( objectWithId )
                .then( function() {
                    return DataStore.get({id: objectWithIdSaveId, type: objectWithId.type})
                } )
                .then( function( objectWithId ) {
                    return DataStore.get( objectWithId );
                } )
                .then( function( testObject ) {
                    objectWithId.foo = uuid.v4();
                    expect( testObject ).to.not.deep.equal( objectWithId );
                    done();
                } );
            } );

            it('should save objects with differing types and same id separately', function( done ){
                var sharedId = uuid.v4();

                var objectWithType = makeValidObject();
                objectWithType.id = sharedId;

                var objectWithNewType = makeValidObject();
                objectWithNewType.type = 'new_type';
                objectWithNewType.id = sharedId;

                Q.all([
                  DataStore.save( objectWithType ),
                  DataStore.save( objectWithNewType )
                ])
                .then( function() {
                   expect( DataStore.get( {id: sharedId, type: objectWithType.type} ) ).to.eventually.deep.equal( objectWithType );
                   expect( DataStore.get( {id: sharedId, type: objectWithNewType.type} ) ).to.eventually.deep.equal( objectWithNewType );
                    done();
                } );

            } );
        } );

        it( 'should have a list function', function() {
            expect( DataStore.list ).to.be.a( 'function' );
        } );

        describe( storeTypeName + '.list', function() {
            var objectType = uuid.v4();

            it( 'should fail without a specified type', function() {
                function failWithoutType() {
                    DataStore.list();
                };
                expect( failWithoutType ).to.throw('Must Specify Type');
            } );

            it( 'should return an object', function() {
                expect( DataStore.list( objectType ) ).to.be.an( 'Object' );
            } );

            it( 'should eventually be an array', function( ) {
                return expect( DataStore.list( objectType ) ).to.eventually.be.an('Array');
            } );

            function test5Objects() {
                var objectType = uuid.v4();
                var object = makeValidObject();
                object.type = objectType;
                var promises = [];
                for ( i = 0; i < 5; i++ ) {
                    var object = makeValidObject();
                    object.type = objectType;
                    promises.push( DataStore.save( object ) );
                };
                return Q.all( promises ).then( function() {
                   return DataStore.list( objectType );
                } );
            }

            it( 'should return an array of test objects', function( ) {
                return expect( test5Objects() ).to.eventually.be.an('Array').of.length( 5 );
            } );

            it( 'should return an array of objects', function() {
                return test5Objects().then(function ( result ) {
                    result.forEach( function( element ) {
                        expect( element ).to.be.an( 'Object' );
                    } );
                } );
            } );

        } );

        it( 'should have a delete function', function() {
            expect( DataStore.delete ).to.be.a( 'function' );
        } );

        describe( storeTypeName + '.delete', function() {
            var objectType = uuid.v4();
            var object = makeValidObject();
            object.type = uuid.v4();

            before( function( done ) {
                DataStore.save( object ).then( function ( id ) {
                    object.id = id;
                    done();
                } );
            } );

            it( 'should fail without an id', function() {
                expect( DataStore.delete ).to.throw( /Requires an id/ );
            } );

            function badGetNoType(){
                DataStore.delete({ id: 'foo' });
            }

            it( 'should fail without a type argument', function(){
                expect( badGetNoType ).to.throw( /Requires a type/ );
            } );

            it( 'should fail when the type is not in the store', function() {
                expect( DataStore.delete({ id: uuid.v4(), type: uuid.v4() }) ).to.be.rejectedWith( /Type not found/ );
            } );

            it( 'should fail when an id not found', function() {
                expect( DataStore.delete( { id: uuid.v4(), type: 'testy' } ) ).to.be.rejectedWith( /Id not found/ );
            } );

            it( 'should delete a valid object', function( ) {
                return expect( DataStore.get( object ) ).to.be.fulfilled
                .then( function() {
                    return expect( DataStore.delete( object ) ).to.be.fulfilled
                    .then( function() {
                      return expect( DataStore.get( object ) ).to.be.rejectedWith( 'Id not found' ).then( function() {
                      return expect( DataStore.list( objectType ) ).to.eventually.be.an('Array').of.length( 0 )
} );
                    } );
                } );
            } );
        } );


    } );
}

module.exports = {
    run: test
}
