var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , chaiAsPromised = require( 'chai-as-promised' )
  , Q     = require( 'q')
  , utils = require('../utils')
;

chai.use( chaiAsPromised );

utils.setupTestDb();

/**
  * Type Name
  * Valid data
  * Invalid data
  * Cycle - Cycle may be undefined, as not all entities are tied to a cycle
 */
function test( entityTypeName, validData, invalidData, cycle ) {

    var EntityRepository = require('../../Entity/'+entityTypeName+'Repository' );

    describe( entityTypeName, function() {

        it( 'should be a module', function() {
            expect(EntityRepository).to.be.an('Object');
        } );

        it( 'should have a setStore function', function() {
            expect( EntityRepository.setStore ).to.be.a( 'function' );
        } );

        EntityRepository.setStore( utils.getTestDbStore() );

        it( 'should have a create function', function() {
            expect(EntityRepository.create).to.be.a('function');
        } );

        describe( entityTypeName + '.create', function() {

            it( 'should fail without data', function() {
                function badSaveNoData(){
                    EntityRepository.create(null, cycle);
                }
                return expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should be rejected on an invalid schema', function() {
                return expect( EntityRepository.create( invalidData(), cycle ) ).to.be.rejectedWith( /Missing required property/ );
            } );

            it( 'should return an id string', function() {
                return EntityRepository.create( validData(), cycle ).then(function( entityId ){
                    return expect( entityId ).to.be.a('string');
                });
            } );

            it( 'should use a new id for new objects', function() {
                var entity1Id, entity2Id;
                return EntityRepository.create( validData(), cycle )
                .then( function( data ) {
                    entity1Id = data;
                    return EntityRepository.create( validData(), cycle );
                } )
                .then( function ( data ) {
                    entity2Id = data;
                    return expect( entity1Id ).to.not.equal( entity2Id );
                } );
            } );

            it( 'should use an id if provided', function() {
                var entityData = validData();
                entityData.id = uuid.v4();
                return EntityRepository.create( entityData, cycle ).then( function ( entityId ) {
                    expect( entityId ).to.equal( entityData.id );
                } );
            } );

        } );

        it( 'should have a load function', function() {
            expect(EntityRepository.load).to.be.a('function');
        } );

        describe( entityTypeName + '.load', function() {
            it( 'should fail if no id string is provided', function() {
                function badLoadNoId() {
                    EntityRepository.load(null, cycle);
                }
                expect( badLoadNoId ).to.throw( 'Id Required' );
            } );

            it( 'should be rejected if id not found', function() {
                return EntityRepository.load( uuid.v4(), cycle )
                    .catch(function( rejection ){
                        console.log('rejected: ',rejection);
                        return expect( rejection.error ).to.equal('not_found');
                    });
            } );


            it( 'should return an object', function() {
                return EntityRepository.create( validData(), cycle )
                    .then( function( entityId ) {
                        return expect( EntityRepository.load( entityId, cycle ) ).to.eventually.be.an('object').with.property('id');
                    } );
            } );

            it( 'should return the object that was created', function() {
                var entity_data = validData();
                entity_data.id = uuid.v4();
                entity_data.foo = 'bar';

                var loaded_entity;

                return EntityRepository.create( entity_data, cycle )
                    .then(function( entityId ){
                        entity_data.type = entityTypeName;
                        return EntityRepository.load( entityId, cycle )
                    })
                    .then(function( entity ){
                        loaded_entity = entity;
                        return expect( loaded_entity.foo ).to.equal( entity_data.foo );
                    })
                    .then( function(){
                        return expect( loaded_entity.id ).to.equal( entity_data.id );
                    });
            } );

        } );


        it( 'should have an update function', function() {
            expect(EntityRepository.update).to.be.a('function');
        } );

        describe( entityTypeName + '.update', function(){
            it( 'should fail without data', function(){
                function badSaveNoData(){
                    EntityRepository.update(null, cycle);
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should fail without an id in data', function(){
                function badSaveNoId(){
                    EntityRepository.update({}, cycle);
                }
                expect( badSaveNoId ).to.throw( 'Id Required' );
            } );

            it( 'should update properties of a previously saved object', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                return EntityRepository.create( entity_data, cycle )
                    .then( function ( entityId ) {
                        return EntityRepository.load( entityId, cycle )
                    })
                    .then(function( entity ){
                        entity.foo = 'new value';
                        return EntityRepository.update( entity, cycle );
                    })
                    .then ( function ( entityId ) {
                        return EntityRepository.load( entityId, cycle );
                    })
                    .then( function( entity ){
                        return expect( entity ).to.have.property( 'foo', 'new value' );
                    });
            } );

            it( 'should fail on update with invalid schema', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                return EntityRepository.create( entity_data, cycle )
                    .then( function( entityId ) {
                        return EntityRepository.load(entityId, cycle);
                    })
                    .then( function (loaded_entity) {
                        var bad_data = invalidData();
                        bad_data.id = loaded_entity.id;
                        bad_data._rev = loaded_entity._rev; //this is bad but pretty much just as bad as the previous test - make it not couch specific
                        return expect( EntityRepository.update( bad_data, cycle ) ).to.be.rejectedWith( /Missing required property/ );
                    });
            } );

        } );

        it( 'should have a list function', function() {
            expect(EntityRepository.list).to.be.a('function');
        } );

        describe( entityTypeName + '.list', function(){
            it( 'should return an array', function() {
                return expect( EntityRepository.list(cycle) ).to.eventually.be.an('Array');
            } );

            // KLUDGE:  We really need to destroy all items and start over in each test
            //          group once we have a destroy();  THis is the number of items up to this point
            it( 'should return an array with 10 elements', function() {
                expect( EntityRepository.list(cycle) ).to.eventually.be.an('Array').of.length( 10 );
            } );
        } );

    } );

}

module.exports = {
    run: test
};
