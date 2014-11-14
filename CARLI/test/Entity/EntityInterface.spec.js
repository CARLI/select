var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , Store = require( '../../Store' )
  , config = require( '../../config' )
  , StoreModule = require( '../../Store/' + config.store )( config.storeOptions )
  , chaiAsPromised = require( 'chai-as-promised' )
  , Q     = require( 'q' )
;

chai.use( chaiAsPromised );

/**
  * Type Name
  * Valid data
  * Invalid data
 */
function test( entityTypeName, validData, invalidData ) {

    var EntityRepository = require('../../Entity/'+entityTypeName+'Repository' );

    describe( entityTypeName, function() {

        it( 'should be a module', function() {
            expect(EntityRepository).to.be.an('Object');
        } );

        it( 'should have a setStore function', function() {
            expect( EntityRepository.setStore ).to.be.a( 'function' );
        } );

        EntityRepository.setStore( Store( StoreModule ) );

        it( 'should have a create function', function() {
            expect(EntityRepository.create).to.be.a('function');
        } );

        describe( entityTypeName + '.create', function() {

            it( 'should fail without data', function() {
                function badSaveNoData(){
                    EntityRepository.create();
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should be rejected on an invalid schema', function() {
                return expect( EntityRepository.create( invalidData() ) ).to.be.rejectedWith( /validation error:/ );
            } );

            it( 'should return an object with an id', function() {
                expect( EntityRepository.create( validData() ) ).to.eventually.be.an('object').and.have.property('id');
            } );

            it( 'should return an object with type of "'+ entityTypeName +'"', function() {
                expect( EntityRepository.create( validData() ) ).to.eventually.have.property('type').to.equal(entityTypeName);
            } );

            it( 'should use a new id for new objects', function() {
                var entity1, entity2;
                return EntityRepository.create( validData() )
                .then( function( data ) {
                    entity1 = data;
                    return EntityRepository.create( validData() );
                } )
                .then( function ( data ) {
                    entity2 = data;
                    return expect( entity1.id ).to.not.equal( entity2.id );
                } );
            } );

            it( 'should use an id if provided', function() {
                var entityData = validData();
                entityData.id = uuid.v4();
                return EntityRepository.create( entityData ).then( function ( entity ) {
                    expect( entity.id ).to.equal( entityData.id );
                } );
            } );

        } );

        it( 'should have a load function', function() {
            expect(EntityRepository.load).to.be.a('function');
        } );

        describe( entityTypeName + '.load', function() {
            it( 'should fail if no id string is provided', function() {
                function badLoadNoId() {
                    EntityRepository.load();
                };
                expect( badLoadNoId ).to.throw( 'Id Required' );
            } );

            it( 'should be rejected if id not found', function() {
                return expect( EntityRepository.load( uuid.v4() ) ).to.be.rejectedWith( 'Id not found' );
            } );


            it( 'should return an object', function() {
                return EntityRepository.create( validData() ).then( function( entity ) {
                    return expect( EntityRepository.load( entity.id ) )
                      .to.eventually.be.an('object').with.property('id');
                } );
            } );

            it( 'should return the object that was created', function() {
                var entity_data = validData();
                entity_data.id = 'thingy';
                entity_data.foo = 'bar';
                var entity = EntityRepository.create( entity_data );
                entity_data.type = entityTypeName;
                expect( EntityRepository.load( 'thingy' ) ).to.eventually.deep.equal( entity_data );
            } );

        } );


        it( 'should have an update function', function() {
            expect(EntityRepository.update).to.be.a('function');
        } );

        describe( entityTypeName + '.update', function(){
            it( 'should fail without data', function(){
                function badSaveNoData(){
                    EntityRepository.update();
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should fail without an id in data', function(){
                function badSaveNoId(){
                    EntityRepository.update({});
                }
                expect( badSaveNoId ).to.throw( 'Id Required' );
            } );

            it( "shouldn't have a false positive because of update with object reference bugs", function() {
                var entity_data = validData();
                entity_data.foo = 'bar';
                return EntityRepository.create( entity_data )
                .then( function( entity ) {
                    entity.foo = 'new value';
                    return EntityRepository.update( entity );
                } )
                .then( function( entity ) {
                    entity.foo = 'garbage';
                    return EntityRepository.load( entity.id );
                } )
                .then( function( entity ) {
                    return expect( entity ).to.not.deep.equal( entity_data );
                } );
            } );

            it( 'should update properties of a previously saved object', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                return EntityRepository.create( entity_data ).then( function ( entity ) {
                    entity.foo = 'new value';
                    return EntityRepository.update( entity );
                } )
                .then ( function ( entity ) {
                    return expect( EntityRepository.load( entity.id ) ).to.eventually.deep.have.property( 'foo', 'new value' );
                } );
            } );

            it( 'should fail on update with invalid schema', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                return EntityRepository.create( entity_data ).then( function( entity ) {
                    entity.foo = 'new value';
                    delete entity.name;
                    return expect( EntityRepository.update( entity ) ).to.be.rejectedWith( /validation error/ );
                } );
            } );

        } );

        it( 'should have a list function', function() {
            expect(EntityRepository.list).to.be.a('function');
        } );

        describe( entityTypeName + '.list', function(){
            it( 'should return an array', function() {
                expect( EntityRepository.list() ).to.eventually.be.an('Array');
            } );

            // KLUDGE:  We really need to destroy all items and start over in each test
            //          group once we have a destroy();  THis is the number of items up to this point
            it( 'should return an array with 10 elements', function() {
                expect( EntityRepository.list() ).to.eventually.be.an('Array').of.length( 10 );
            } );
        } );

    } );

}

module.exports = {
    run: test
}
