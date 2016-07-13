var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var Q = require('q');
var uuid = require('node-uuid');

var entityTransform = require('../Entity/EntityTransformationUtils.js');
var licenseRepository = require('../Entity/LicenseRepository');
var utils = require('./utils');
var vendorRepository = require('../Entity/VendorRepository');

entityTransform.setEntityLookupStores(utils.getTestDbStore());

chai.use(chaiAsPromised);

function undefinedValue() {
}

var testDateString = 'January 1, 2015 00:00:01';
var testDateIsoStr = '2015-01-01T06:00:01.000Z';

describe('The entityTransform Module', function () {

    it('should be a module', function () {
        expect(entityTransform).to.be.an('Object');
    });
});

describe('The transformObjectForPersistence function', function () {
    it('should be a function', function () {
        expect(entityTransform.transformObjectForPersistence).to.be.a('Function');
    });

    it('should replace an Object property with the Objects ID', function () {
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

        entityTransform.transformObjectForPersistence(testEntity, ['testProperty', 'another']);
        expect(testEntity.testProperty).to.equal('foo');
        expect(testEntity.another).to.equal('another');
    });

});

describe('the setDefaultValueForStringProperty method', function () {
    it('should be a function', function () {
        expect(entityTransform.setDefaultValueForStringProperty).to.be.a('function');
    });

    it('should replace an undefined property on an object with an empty string', function () {
        var testObject = {
            foo: undefinedValue()
        };
        entityTransform.setDefaultValueForStringProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', '');
    });

    it('should not replace an property with a value', function () {
        var testObject = {
            foo: 'bar'
        };
        entityTransform.setDefaultValueForStringProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', 'bar');
    });
});

describe('the setDefaultValueForIntegerProperty method', function () {
    it('should be a function', function () {
        expect(entityTransform.setDefaultValueForIntegerProperty).to.be.a('function');
    });

    it('should replace an undefined property on an object with zero', function () {
        var testObject = {
            foo: undefinedValue()
        };
        entityTransform.setDefaultValueForIntegerProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', 0);
    });

    it('should not replace an property with a value', function () {
        var testObject = {
            foo: 3
        };
        entityTransform.setDefaultValueForIntegerProperty(testObject, 'foo');
        expect(testObject).to.have.property('foo', 3);
    });
});

describe('the setDefaultValuesForEntity method', function () {
    it('should be a function', function () {
        expect(entityTransform.setDefaultValuesForEntity).to.be.a('function');
    });

    it('should replace undefined string properties with empty strings', function () {
        var testOffering = {
            type: 'Offering',
            libraryComments: undefinedValue()
        };

        entityTransform.setDefaultValuesForEntity(testOffering);
        expect(testOffering).to.have.property('libraryComments', '');
    });

    it('should replace undefined integer properties with zeroes', function () {
        var testLibraryNonCrm = {
            type: 'LibraryNonCrm',
            gar: undefinedValue(),
            fte: undefinedValue()
        };

        entityTransform.setDefaultValuesForEntity(testLibraryNonCrm);
        expect(testLibraryNonCrm).to.have.property('gar', '');
        expect(testLibraryNonCrm).to.have.property('fte', 0);
    });

    it('should replace Date objects with ISO strings', function () {
        var testOffering = {
            type: 'License',
            vendor: 'test',
            effectiveDate: new Date(testDateString)
        };

        entityTransform.setDefaultValuesForEntity(testOffering);
        expect(testOffering).to.have.property('effectiveDate', testDateIsoStr);
    });
});

describe('the convertDateObjectToString method', function () {
    it('should be a function', function () {
        expect(entityTransform.convertDateObjectToString).to.be.a('function');
    });

    it('should return an empty string when called with no arguments', function () {
        expect(entityTransform.convertDateObjectToString()).to.equal('');
    });

    it('should return the original value if the argument is not a Date object', function () {
        var testObj = {};
        var testString = "foobar";
        expect(entityTransform.convertDateObjectToString(testObj)).to.equal(testObj);
        expect(entityTransform.convertDateObjectToString(testString)).to.equal(testString);
    });

    it('should return the ISO string for a date object', function () {
        var testDate = new Date(testDateString);
        expect(entityTransform.convertDateObjectToString(testDate)).to.equal(testDateIsoStr);
    });
});

describe('The expandObjectFromPersistence function', function () {
    it('should be a function', function () {
        expect(entityTransform.expandObjectFromPersistence).to.be.a('Function');
    });

    it('should expand references to objects in entities', function () {
        var vendor = {id: uuid.v4(), type: "Vendor", name: "my vendor name"};
        var license = {id: uuid.v4(), type: "License", name: "my license name", vendor: 'Some Bogus Vendor'};
        var product = {
            id: "product1",
            type: "Product",
            name: "my product name",
            vendor: vendor.id,
            license: license.id
        };

        var referencesToExpand = ['vendor', 'license'];

        return vendorRepository.create(vendor)
            .then(function () {
                return licenseRepository.create(license);
            })
            .then(function () {
                return entityTransform.expandObjectFromPersistence(product, referencesToExpand);
            })
            .then(function () {
                return expect(product.vendor).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(product.license).to.be.an('object').and.have.property('name');
            });
    });

    it('should load the latest Entity values');
    //For now the list test also exercises the method this would test.

    it('should add functions to instances of entities', function () {
        var entity = {};
        var testFunction = function () {
        };
        var functionsToAdd = {'testFunction': testFunction};

        entityTransform.expandObjectFromPersistence(entity, [], functionsToAdd);

        expect(entity.testFunction).to.be.a('Function');
    });

    it('should expand libraries, including non-crm data', function () {
        var nonCrmLibraryData = {};

        return libraryRe

        //load lib
        //add non-crm data
        //save lib
        //call expand on something with a library reference
        //expect non-crm data to be legit
    });
});

describe('The expandListOfObjectsFromPersistence', function () {
    it('should be a function', function () {
        expect(entityTransform.expandListOfObjectsFromPersistence).to.be.a('Function');
    });

    //Shared between the next two tests to verify that we load it correctly once and then load the changed values
    var vendor1 = {id: uuid.v4(), type: "Vendor", name: "my vendor name"};
    var license1 = {id: uuid.v4(), type: "License", name: "my license name", vendor: vendor1.id};
    var vendor2 = {id: uuid.v4(), type: "Vendor", name: "my other vendor name"};
    var license2 = {id: uuid.v4(), type: "License", name: "my other license name", vendor: vendor2.id};

    it('should expand references to objects in entities', function () {
        var productList = [
            {id: "product1", type: "Product", name: "my product name 1", vendor: vendor1.id, license: license1.id},
            {id: "product2", type: "Product", name: "my product name 2", vendor: vendor2.id, license: license2.id},
            {id: "product3", type: "Product", name: "my product name 3", vendor: vendor2.id, license: license2.id}
        ];

        var deferred = Q.defer();
        deferred.resolve(productList);
        var listPromise = deferred.promise;
        var referencesToExpand = ['vendor', 'license'];

        return vendorRepository.create(vendor1)
            .then(function () {
                return vendorRepository.create(vendor2);
            })
            .then(function () {
                return licenseRepository.create(license1);
            })
            .then(function () {
                return licenseRepository.create(license2);
            })
            .then(function () {
                return entityTransform.expandListOfObjectsFromPersistence(listPromise, referencesToExpand, {});
            })
            .then(function () {
                return expect(productList[0].vendor).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(productList[0].vendor.id).to.equal(vendor1.id);
            })
            .then(function () {
                return expect(productList[0].license).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(productList[0].license.id).to.equal(license1.id);
            })
            .then(function () {
                return expect(productList[2].vendor).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(productList[2].vendor.id).to.equal(vendor2.id);
            })
            .then(function () {
                return expect(productList[2].license).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(productList[2].license.id).to.equal(license2.id);
            });
    });

    it('should load the latest Entity values', function () {
        var productList = [
            {id: "product1", type: "Product", name: "my product name 1", vendor: vendor1.id, license: license1.id},
            {id: "product2", type: "Product", name: "my product name 2", vendor: vendor2.id, license: license2.id},
            {id: "product3", type: "Product", name: "my product name 3", vendor: vendor2.id, license: license2.id}
        ];

        var deferred = Q.defer();
        deferred.resolve(productList);
        var listPromise = deferred.promise;
        var referencesToExpand = ['vendor', 'license'];

        var newVendorName = "A different vendor name";
        var newlicenseName = "A different license name";

        return vendorRepository.load(vendor1.id)
            .then(function (vendor) {
                vendor.name = newVendorName;
                return vendorRepository.update(vendor);
            })
            .then(function () {
                return licenseRepository.load(license1.id);
            })
            .then(function (license) {
                license.name = newlicenseName;
                return licenseRepository.update(license);
            })
            .then(function () {
                return entityTransform.expandListOfObjectsFromPersistence(listPromise, referencesToExpand, {});
            })
            .then(function () {
                return expect(productList[0].vendor).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(productList[0].vendor.name).to.equal(newVendorName);
            })
            .then(function () {
                return expect(productList[0].license).to.be.an('object').and.have.property('name');
            })
            .then(function () {
                return expect(productList[0].license.name).to.equal(newlicenseName);
            })
    });
});

describe('extractValuesForProperties', function () {
    it('should be a function', function () {
        expect(entityTransform.extractValuesForProperties).to.be.a('function');
    });
    it('should return an object containing only the specified properties', function () {
        var testObject = {
            one: "fish",
            two: "fish"
        };
        var expectedResult = {
            one: "fish"
        };
        expect(entityTransform.extractValuesForProperties(testObject, ['one'])).to.deep.equal(expectedResult);
    });
});

describe('extractValuesForSchema', function () {
    it('should be a function', function () {
        expect(entityTransform.extractValuesForSchema).to.be.a('function');
    });

    it('should return an object', function () {
        expect(entityTransform.extractValuesForSchema({}, 'LibraryNonCrm')).to.be.an('object');
    })
});
