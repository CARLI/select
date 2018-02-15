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

        it( 'should have a getOptions method', function() {
            expect(DataStore.getOptions).to.be.a('function');
        } );

        it( 'should have a save function', function() {
            expect(DataStore.save).to.be.a('function');
        } );

        describe( storeTypeName + '.save', function() {

            it( 'should fail without data', function() {
                expect( DataStore.save() ).to.be.rejectedWith( /Requires Data/ );
            } );

            it( 'should fail without an id property in the data', function() {
                expect( DataStore.save( {type: 'test'} ) ).to.be.rejectedWith( /Requires id property/ );
            } );

            it( 'should save data and return id', function() {
                var testId = uuid.v4();
                var testObject = makeValidObject();
                testObject.id = testId;
                return expect( DataStore.save( testObject ) ).to.eventually.have.deep.property( 'id', testId );
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
                expect( DataStore.get() ).to.be.rejectedWith( /Requires an id/ );
            } );

            it( 'should fail when an id not found', function() {
                return DataStore.get(uuid.v4())
                    .catch(function( rejection ){
                        return expect( rejection.error ).to.equal('not_found');
                    });
            } );

            it( 'should return stored data for id', function() {
                return expect( DataStore.get(simpleObjectSaveId) ).to.eventually.deep.have.deep.property( 'id', simpleObject.id );
            } );

            it( 'should update the store if called with the same id', function(){
                var new_value = uuid.v4();
                return DataStore.get(objectWithId.id)
                .then( function( object ) {
                    object.foo = new_value;
                    return DataStore.save( object )
                }).then( function( savedObject ) {
                    return expect(DataStore.get(objectWithIdSaveId)).to.eventually.have.deep.property( 'foo', new_value );
                });
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
                expect( DataStore.list() ).to.be.rejectedWith('Must Specify Type');
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
                }
                return Q.all( promises ).then( function() {
                   return DataStore.list( objectType );
                } );
            }

            it( 'should return an array of test objects with the right size and object contents', function( ) {
                return expect( test5Objects() )
                    .to.eventually.be.an('Array').of.length(5);
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
            object.type = objectType;

            before( function( done ) {
                DataStore.save( object ).then( function ( result ) {
                    object.id = result.id;
                    done();
                } );
            } );

            it( 'should fail without an id', function() {
                expect( DataStore.delete() ).to.be.rejectedWith( /Requires an id/ );
            } );

            it( 'should fail when an id not found', function() {
                expect( DataStore.delete(uuid.v4()) ).to.be.rejectedWith( /not_found/ );
            } );

            it('should delete a valid object', function () {
                return expect( DataStore.get(object.id) ).to.be.fulfilled
                .then(function () {
                    return expect( DataStore.delete(object.id) ).to.be.fulfilled;
                })
                .then(function () {
                    return expect( DataStore.get(object.id) ).to.be.rejected;
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
};
