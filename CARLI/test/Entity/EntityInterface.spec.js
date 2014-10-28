var chai   = require( 'chai' )
  , expect = chai.expect
  , uuid   = require( 'node-uuid' )
  , Store = require( '../../Store' )
  , MemoryStore = require('../../Store/MemoryStore')
;

/**
  * Type Name
  * Valid data
  * Invalid data
 */
function test( entityTypeName, validData ) {

    var Entity = require('../../Entity/'+entityTypeName );

    describe( entityTypeName, function() {

        it( 'should be a module', function() {
            expect(Entity).to.be.an('Object');
        } );

        it( 'should have a setStore function', function() {
            expect( Entity.setStore ).to.be.a( 'function' );
        } );

        Entity.setStore( Store( MemoryStore ) );

        it( 'should have a create function', function() {
            expect(Entity.create).to.be.a('function');
        } );

        describe( entityTypeName + '.create', function() {

            it( 'should fail without data', function() {
                function badSaveNoData(){
                    Entity.create();
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should return an object with an id', function() {
                expect( Entity.create( validData() ) ).to.be.an('object').and.have.property('id');
            } );

            it( 'should return an object with type of "'+ entityTypeName +'"', function() {
                expect( Entity.create( validData() ) ).to.have.property('type').to.equal(entityTypeName);
            } );

            it( 'should use a new id for new objects', function() {
                var entity1 = Entity.create( validData() );
                var entity2 = Entity.create( validData() );
                expect( entity1.id ).to.not.equal( entity2.id );;
            } );

            it( 'should use an id if provided', function() {
                var entityData = validData();
                entityData.id = 'foo';
                var entity = Entity.create( entityData );
                expect( entity.id ).to.equal('foo');
            } );

        } );

        it( 'should have a load function', function() {
            expect(Entity.load).to.be.a('function');
        } );

        describe( entityTypeName + '.load', function() {
            it( 'should fail if no id string is provided', function() {
                function badLoadNoId() {
                    Entity.load();
                };
                expect( badLoadNoId ).to.throw( 'Id Required' );
            } );

            it( 'should return false if id not found', function() {
                expect( Entity.load( uuid.v4() ) ).to.be.false;
            } );

            it( 'should fail on an invalid schema', function() {
                function badEntitySchema() {
                  Entity.create( {} );
                };
                expect( badEntitySchema ).to.throw( 'Missing required property: name' );
            } );

            it( 'should return an object', function() {
                var entity = Entity.create( validData() );
                expect( Entity.load( entity.id ) ).to.be.an('object');
            } );

            it( 'should return the object that was created', function() {
                var entity_data = validData();
                entity_data.id = 'thingy';
                entity_data.foo = 'bar';
                var entity = Entity.create( entity_data );
                entity_data.type = entityTypeName;
                expect( Entity.load( 'thingy' ) ).deep.equal( entity_data );
            } );

        } );


        it( 'should have an update function', function() {
            expect(Entity.update).to.be.a('function');
        } );

        describe( entityTypeName + '.update', function(){
            it( 'should fail without data', function(){
                function badSaveNoData(){
                    Entity.update();
                }
                expect( badSaveNoData ).to.throw( 'Data Required' );
            } );

            it( 'should fail without an id in data', function(){
                function badSaveNoId(){
                    Entity.update({});
                }
                expect( badSaveNoId ).to.throw( 'Id Required' );
            } );

            it( "shouldn't have a false positive because of update with object reference bugs", function() {
                var entity_data = validData();
                entity_data.foo = 'bar';
                var entity = Entity.create( entity_data );
                entity.foo = 'new value';
                Entity.update( entity );
                var storedEntity = Entity.load( entity.id );
                entity.foo = 'garbage';
                expect( storedEntity ).to.not.deep.equal( entity );
            } );

            it( 'should update properties of a previously saved object', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                var entity = Entity.create( entity_data );
                entity.foo = 'new value';
                Entity.update( entity );
                expect( Entity.load( entity.id ) ).to.deep.equal( entity );
            } );

            it( 'should fail on update with invalid schema', function(){
                var entity_data = validData();
                entity_data.foo = 'bar';
                var entity = Entity.create( entity_data );
                entity.foo = 'new value';
                delete entity.name;
                function updateBadEntity() {
                  Entity.update( entity );
                }
                expect( updateBadEntity ).to.throw( 'Missing required property: name' );
            } );

        } );

        it( 'should have a list function', function() {
            expect(Entity.list).to.be.a('function');
        } );

        describe( entityTypeName + '.list', function(){
            it( 'should return an array', function() {
                expect( Entity.list() ).to.be.an('Array');
            } );

            // KLUDGE:  We really need to destroy all items and start over in each test
            //          group once we have a destroy();  THis is the number of items up to this point
            it( 'should return an array with 10 elements', function() {
                expect( Entity.list() ).to.be.an('Array').of.length( 10 );
            } );
        } );

    } );

}

module.exports = {
    run: test
}
