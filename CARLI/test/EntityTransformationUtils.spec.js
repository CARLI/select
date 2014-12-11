var chai   = require( 'chai' )
    , expect = chai.expect
    , chaiAsPromised = require( 'chai-as-promised')
    , VendorRepository = require('../Entity/VendorRepository')
    , LicenseRepository = require('../Entity/LicenseRepository')
    , EntityTransform = require( '../Entity/EntityTransformationUtils.js' )
    , uuid   = require( 'node-uuid' )
    ;

chai.use( chaiAsPromised );

describe( 'The EntityTransform Module', function() {

    it( 'should be a module', function() {
        expect( EntityTransform ).to.be.an('Object');
    });
});



describe('The removeEmptyContactsFromEntity(), function', function() {
    it('should be a function', function () {
        expect(EntityTransform.removeEmptyContactsFromEntity).to.be.a('Function');
    });

    it('remove empty contacts from an entity', function () {
        entity = {
            name: 'Test Library',
            type: 'Library',
            contacts: [
                {
                    "contactType": "Empty"
                },
                {
                    "contactType": "Director",
                    "name": "Bob Martin",
                    "email": "bob@cleancode.org",
                    "phoneNumber": "123-555-1234"
                },
                {
                    "contactType": "Empty"
                },
                {
                    "name": "Not Empty"
                },
                {
                    "email": "Not Empty"
                },
                {
                    "phoneNumber": "Not Empty"
                }
            ]
        };
        expect(entity.contacts.length).to.equal(6);
        EntityTransform.removeEmptyContactsFromEntity(entity);
        expect(entity.contacts.length).to.equal(2);
    });
});


describe('The transformObjectForPersistence function', function(){
    it('should be a function', function () {
        expect(EntityTransform.transformObjectForPersistence).to.be.a('Function');
    });

    it('should replace an Object property with the Objects ID', function (){
        var testEntity = {
            name: 'testEntity',
            testProperty: {
                id: 'foo',
                other_property: "hello"
            },
            another: {
                id: 'another',
                foo: "bar"
            }
        };

        EntityTransform.transformObjectForPersistence( testEntity, {'testProperty':{}, 'another': {}} );
        expect(testEntity.testProperty).to.equal('foo');
        expect(testEntity.another).to.equal('another');
    });


    it('should remove helper functions from the entity', function (){
        var testEntity = {
            name: 'testEntity',
            filterFunction: function () { var a=0 },
            filterFunction2: function () { var b=0 },
            prop1: 'value'
        };

        expect(testEntity.filterFunction).to.exist;
        EntityTransform.transformObjectForPersistence( testEntity, {} );
        expect(testEntity.filterFunction).to.not.exist;
        expect(testEntity.filterFunction2).to.not.exist;
    });
});


describe('The expandObjectFromPersistence function', function(){
    it('should be a function', function () {
        expect(EntityTransform.expandObjectFromPersistence).to.be.a('Function');
    });

    it('should expand references to objects in entities', function(){
        var vendor = { id: uuid.v4(), type: "Vendor", name: "my vendor name"};
        var license = {id: uuid.v4(), type: "License", name: "my license name", vendor: 'Some Bogus Vendor'};
        var product = { id: "product1", type: "Product", name: "my product name", vendor: vendor.id, license: license.id };

        var referencesToExpand = ['vendor', 'license'];

        return VendorRepository.create( vendor )
            .then( function(){
                return LicenseRepository.create( license );
            })
            .then( function() {
                return EntityTransform.expandObjectFromPersistence( product, referencesToExpand );
            })
            .then( function () {
                return expect( product.vendor ).to.be.an('object').and.have.property('name');
            })
            .then( function(){
                return expect( product.license ).to.be.an('object').and.have.property('name');
            });
    });
});