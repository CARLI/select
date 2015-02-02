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
            type:   'testType'
        }
    }

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

            it( 'should save data and return id', function() {
                var id = uuid.v4();
                return expect( DataStore.save( { id: id, type: 'testType' } ) ).to.eventually.have.deep.property( 'id', id );
            } );

            it( 'should be able to save document twice (update)', function() {
                var id = uuid.v4();
                return DataStore.save( { id: id, type: 'testType' } )
                .then( function( new_doc ) {
                    return expect( DataStore.save( new_doc ) ).to.eventually.have.deep.property( 'id', id );
                } );
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
                    simpleObjectSaveId = ids[0].id;
                    objectWithIdSaveId = ids[1].id;
                    done();
                } );
            } );

            it( 'should fail without an id', function() {
                expect( DataStore.get ).to.throw( /Requires an id/ );
            } );

            it( 'should fail when an id not found', function() {
                return expect( DataStore.get( { id: uuid.v4(), type: 'testType' } )).to.be.rejectedWith( /not_found/ );
            } );

            it( 'should return stored data for id', function() {
                return expect( DataStore.get( { id: simpleObjectSaveId, type: simpleObject.type } ) ).to.eventually.deep.have.deep.property( 'id', simpleObject.id );
            } );

            it( 'should update the store if called with the same id', function(){
                var new_value = uuid.v4();
                return DataStore.get( { id: objectWithId.id, type: objectWithId.type } )
                .then( function( object ) {
                    object.foo = new_value;
                    return DataStore.save( object )
                }).then( function( savedObject ) {
                    return expect(DataStore.get( { id: objectWithIdSaveId, type: objectWithId.type } ) ).to.eventually.have.deep.property( 'foo', new_value );
                } );
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

            it( 'should return an array of test objects with the right size and object contents', function( ) {
                return expect( test5Objects() )
                    .to.eventually.be.an('Array').of.length(5)
                    .to.have.deep.property('[4].type');
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
                DataStore.save( object ).then( function ( result ) {
                    object.id = result.id;
                    done();
                } );
            } );

            it( 'should fail without an id', function() {
                expect( DataStore.delete ).to.throw( /Requires an id/ );
            } );

            it( 'should fail when an id not found', function() {
                expect( DataStore.delete( { id: uuid.v4(), type: 'testType' } ) )
                  .to.be.rejectedWith( /not_found/ );
            } );

            it('should delete a valid object', function () {
                return expect( DataStore.get(object) ).to.be.fulfilled
                .then(function () {
                    return expect( DataStore.delete(object) ).to.be.fulfilled;
                })
                .then(function () {
                    return expect( DataStore.get(object) ).to.be.rejected;
                })
                .then(function () {
                    return expect( DataStore.list(objectType) ).to.eventually.be.an('Array').of.length(0)
                });
            });
        } );


    } );
}

module.exports = {
    run: test
}
