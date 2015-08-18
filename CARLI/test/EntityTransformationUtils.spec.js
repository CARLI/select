var chai   = require( 'chai' )
    , expect = chai.expect
    , chaiAsPromised = require( 'chai-as-promised')
    , VendorRepository = require('../Entity/VendorRepository')
    , LicenseRepository = require('../Entity/LicenseRepository')
    , EntityTransform = require( '../Entity/EntityTransformationUtils.js' )
    , uuid   = require( 'node-uuid' )
    , Q = require('q')
    , utils = require('./utils')
    ;

EntityTransform.setEntityLookupStores( utils.getTestDbStore() );

chai.use( chaiAsPromised );

function undefinedValue(){}

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

        EntityTransform.transformObjectForPersistence( testEntity, ['testProperty', 'another'] );
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

describe('the setDefaultValueForStringProperty method', function(){
    it('should be a function', function(){
        expect(EntityTransform.setDefaultValueForStringProperty).to.be.a('function');
    });

    it('should replace an undefined property on an object with an empty string', function(){
        var testObject = {
            foo: undefinedValue()
        };
        EntityTransform.setDefaultValueForStringProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', '');
    });

    it('should not replace an property with a value', function(){
        var testObject = {
            foo: 'bar'
        };
        EntityTransform.setDefaultValueForStringProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', 'bar');
    });
});

describe('the setDefaultValueForIntegerProperty method', function(){
    it('should be a function', function(){
        expect(EntityTransform.setDefaultValueForIntegerProperty).to.be.a('function');
    });

    it('should replace an undefined property on an object with zero', function(){
        var testObject = {
            foo: undefinedValue()
        };
        EntityTransform.setDefaultValueForIntegerProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', 0);
    });

    it('should not replace an property with a value', function(){
        var testObject = {
            foo: 3
        };
        EntityTransform.setDefaultValueForIntegerProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', 3);
    });
});

describe('the setDefaultValuesForEntity method', function(){
    it('should be a function', function(){
        expect(EntityTransform.setDefaultValuesForEntity).to.be.a('function');
    });

    it('should replace undefined string properties with empty strings', function(){
        var testOffering = {
            type: 'Offering',
            libraryComments: undefinedValue()
        };

        EntityTransform.setDefaultValuesForEntity(testOffering);
        expect(testOffering).to.have.property('libraryComments', '');
    });

    it('should replace undefined integer properties with zeroes', function(){
        var testLibraryNonCrm = {
            type: 'LibraryNonCrm',
            gar: undefinedValue(),
            fte: undefinedValue()
        };

        EntityTransform.setDefaultValuesForEntity(testLibraryNonCrm);
        expect(testLibraryNonCrm).to.have.property('gar', '');
        expect(testLibraryNonCrm).to.have.property('fte', 0);
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

    it('should load the latest Entity values');
    //For now the list test also exercises the method this would test.

    it('should add functions to instances of entities', function () {
        var entity = {};
        var testFunction = function(){};
        var functionsToAdd = { 'testFunction': testFunction };

        EntityTransform.expandObjectFromPersistence(entity, [], functionsToAdd);

        expect(entity.testFunction).to.be.a('Function');
    });

});

describe('The expandListOfObjectsFromPersistence', function(){
    it('should be a function', function(){
        expect(EntityTransform.expandListOfObjectsFromPersistence).to.be.a('Function');
    });

    //Shared between the next two tests to verify that we load it correctly once and then load the changed values
    var vendor1 = { id: uuid.v4(), type: "Vendor", name: "my vendor name"};
    var license1 = {id: uuid.v4(), type: "License", name: "my license name", vendor: vendor1.id};
    var vendor2 = { id: uuid.v4(), type: "Vendor", name: "my other vendor name"};
    var license2 = {id: uuid.v4(), type: "License", name: "my other license name", vendor: vendor2.id};

    it('should expand references to objects in entities', function(){
        var productList = [
            { id: "product1", type: "Product", name: "my product name 1", vendor: vendor1.id, license: license1.id },
            { id: "product2", type: "Product", name: "my product name 2", vendor: vendor2.id, license: license2.id },
            { id: "product3", type: "Product", name: "my product name 3", vendor: vendor2.id, license: license2.id }
        ];

        var deferred = Q.defer();
        deferred.resolve(productList);
        var listPromise = deferred.promise;
        var referencesToExpand = ['vendor', 'license'];

        return VendorRepository.create( vendor1 )
            .then( function() {
                return VendorRepository.create( vendor2 );
            })
            .then( function() {
                return LicenseRepository.create( license1 );
            })
            .then( function() {
                return LicenseRepository.create( license2 );
            })
            .then( function() {
                return EntityTransform.expandListOfObjectsFromPersistence( listPromise, referencesToExpand, {} );
            })
            .then( function () {
                return expect( productList[0].vendor ).to.be.an('object').and.have.property('name');
            })
            .then( function () {
                return expect( productList[0].vendor.id ).to.equal(vendor1.id);
            })
            .then( function(){
                return expect( productList[0].license ).to.be.an('object').and.have.property('name');
            })
            .then( function () {
                return expect( productList[0].license.id ).to.equal(license1.id);
            })
            .then( function () {
                return expect( productList[2].vendor ).to.be.an('object').and.have.property('name');
            })
            .then( function () {
                return expect( productList[2].vendor.id ).to.equal(vendor2.id);
            })
            .then( function(){
                return expect( productList[2].license ).to.be.an('object').and.have.property('name');
            })
            .then( function () {
                return expect( productList[2].license.id ).to.equal(license2.id);
            });
    });

    it('should load the latest Entity values', function(){
        var productList = [
            { id: "product1", type: "Product", name: "my product name 1", vendor: vendor1.id, license: license1.id },
            { id: "product2", type: "Product", name: "my product name 2", vendor: vendor2.id, license: license2.id },
            { id: "product3", type: "Product", name: "my product name 3", vendor: vendor2.id, license: license2.id }
        ];

        var deferred = Q.defer();
        deferred.resolve(productList);
        var listPromise = deferred.promise;
        var referencesToExpand = ['vendor', 'license'];

        var newVendorName = "A different vendor name";
        var newlicenseName = "A different license name";

        return VendorRepository.load( vendor1.id )
            .then( function( vendor ) {
                vendor.name = newVendorName;
                return VendorRepository.update( vendor );
            })
            .then( function() {
                return LicenseRepository.load( license1.id );
            })
            .then( function( license ) {
                license.name = newlicenseName;
                return LicenseRepository.update( license );
            })
            .then( function() {
                return EntityTransform.expandListOfObjectsFromPersistence( listPromise, referencesToExpand, {} );
            })
            .then( function () {
                return expect( productList[0].vendor ).to.be.an('object').and.have.property('name');
            })
            .then( function () {
                return expect( productList[0].vendor.name ).to.equal(newVendorName);
            })
            .then( function(){
                return expect( productList[0].license ).to.be.an('object').and.have.property('name');
            })
            .then( function () {
                return expect( productList[0].license.name ).to.equal(newlicenseName);
            })
    });
});

describe('extractValuesForProperties', function(){
    it('should be a function', function(){
        expect(EntityTransform.extractValuesForProperties).to.be.a('function');
    });
    it('should return an object containing only the specified properties', function(){
        var testObject = {
            one: "fish",
            two: "fish"
        };
        var expectedResult = {
            one: "fish"
        };
        expect(EntityTransform.extractValuesForProperties(testObject, [ 'one' ])).to.deep.equal(expectedResult);
    });
});

describe('extractValuesForSchema', function() {
    it('should be a function', function () {
        expect(EntityTransform.extractValuesForSchema).to.be.a('function');
    });

    it('should return an object', function() {
        expect( EntityTransform.extractValuesForSchema({}, 'LibraryNonCrm')).to.be.an('object');
    })
});
