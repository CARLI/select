var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , Store = require( '../../Store' )
  , MemoryStore = require('../../Store/MemoryStore')()
;

/**
  * Type Name
  * Valid data
  * Invalid data
 */
function test( entityTypeName, validData, invalidData ) {

    var EntityRepository = require('../../Entity/'+entityTypeName+'Repository' );

    describe.skip( entityTypeName, function() {

        it( 'should be a module', function() {
            expect(EntityRepository).to.be.an('Object');
        } );

        it( 'should have a setStore function', function() {
            expect( EntityRepository.setStore ).to.be.a( 'function' );
        } );

        EntityRepository.setStore( Store( MemoryStore ) );

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

            it( 'should return an object with an id', function() {
                expect( EntityRepository.create( validData() ) ).to.be.an('object').and.have.property('id');
            } );

            it( 'should return an object with type of "'+ entityTypeName +'"', function() {
                expect( EntityRepository.create( validData() ) ).to.have.property('type').to.equal(entityTypeName);
            } );

            it( 'should use a new id for new objects', function() {
                var entity1 = EntityRepository.create( validData() );
                var entity2 = EntityRepository.create( validData() );
                expect( entity1.id ).to.not.equal( entity2.id );;
            } );

            it( 'should use an id if provided', function() {
                var entityData = validData();
                entityData.id = 'foo';
                var entity = EntityRepository.create( entityData );
                expect( entity.id ).to.equal('foo');
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

            it( 'should return false if id not found', function() {
                expect( EntityRepository.load( uuid.v4() ) ).to.be.false;
            } );

            it( 'should fail on an invalid schema', function() {
                function badEntitySchema() {
                  EntityRepository.create( invalidData() );
                };
                expect( badEntitySchema ).to.throw( /ValidationError/i );
            } );

            it( 'should return an object', function() {
                var entity = EntityRepository.create( validData() );
                expect( EntityRepository.load( entity.id ) ).to.be.an('object');
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
                var entity = EntityRepository.create( entity_data );
                entity.foo = 'new value';
                EntityRepository.update( entity );
                var storedEntity = EntityRepository.load( entity.id );
                entity.foo = 'garbage';
                expect( storedEntity ).to.not.deep.equal( entity );
            } );

            it( 'should update properties of a previously saved object', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                var entity = EntityRepository.create( entity_data );
                entity.foo = 'new value';
                EntityRepository.update( entity );
                expect( EntityRepository.load( entity.id ) ).to.eventually.deep.equal( entity );
            } );

            it( 'should fail on update with invalid schema', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                var entity = EntityRepository.create( entity_data );
                entity.foo = 'new value';
                delete entity.name;
                function updateBadEntity() {
                  EntityRepository.update( entity );
                }
                expect( updateBadEntity ).to.throw( /ValidationError/i );
            } );

        } );

        it( 'should have a list function', function() {
            expect(EntityRepository.list).to.be.a('function');
        } );

        describe( entityTypeName + '.list', function(){
            it( 'should return an array', function() {
                expect( EntityRepository.list() ).to.be.an('Array');
            } );

            // KLUDGE:  We really need to destroy all items and start over in each test
            //          group once we have a destroy();  THis is the number of items up to this point
            it( 'should return an array with 10 elements', function() {
                expect( EntityRepository.list() ).to.be.an('Array').of.length( 10 );
            } );
        } );

    } );

}

module.exports = {
    run: test
}
