var chai = require( 'chai' );
var expect = chai.expect;
var entityCache  = require( '../Entity/entityCache' );

describe('The entity cache factory', function() {

    it('should be a module', function() {
        expect(entityCache).to.be.an('object');
    });

    it('should export a createCache function', function() {
        expect(entityCache.createCache).to.be.a('function');
    });

    describe('Entity cache', function() {
        var cache;
        beforeEach(function() {
            cache = entityCache.createCache(entityCache.INFINITE_TIMEOUT);
        });
        describe('adding a thing to the cache', function() {
            it('should have an add function', function () {
                expect(cache.add).to.be.a('function');
            });
            it('should silently ignore data without an id', function() {
                cache.add({});
            });
            it('should add an object that can be retrieved by id', function() {
                var testObject = { id: 1234, color: 'blue' };
                cache.add(testObject);
                expect(cache.get(testObject.id)).to.have.property('color', 'blue');
            });
            it('should add two objects that can be retrieved', function() {
                var testObject1 = { id: 1234, color: 'blue' };
                var testObject2 = { id: 5678, color: 'red' };
                cache.add(testObject1);
                cache.add(testObject2);
                expect(cache.get(testObject1.id)).to.have.property('color', 'blue');
                expect(cache.get(testObject2.id)).to.have.property('color', 'red');
            });
        });
        describe('cache.delete', function() {
            it('should remove an entity from the cache by id', function(){
                var testObject = { id: 1234, color: 'blue' };
                cache.add(testObject);
                expect(cache.get(testObject.id)).to.have.property('color', 'blue');
                cache.delete(testObject.id);
                expect(cache.get(testObject.id)).to.be.a('null');
            });
        });
        describe('cache.get', function() {
            it('should return null for an id that was never added to the cache', function(){
                expect(cache.get(5551212)).to.be.a('null');
            });
            it('should expire data from the cache after the timeout has passed', function(){
                // We're using an instant timeout to test rather than some asynchronous mess
                var cache = entityCache.createCache(entityCache.INSTANT_TIMEOUT);
                var testObject = { id: 1234, color: 'blue' };
                cache.add(testObject);
                expect(cache.get(testObject.id)).to.be.a('null');
            });
        });
    });
});


