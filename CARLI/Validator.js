var tv4 = require('tv4')
  , Q = require( 'q' )
;

var schemas = {
    Contact: require('../schemas/Contact.json'),
    CycleType: require('../schemas/CycleType.json'),
    Date: require('../schemas/Date.json'),
    Library: require('../schemas/Library.json'),
    License: require('../schemas/License.json'),
    OneTimePurchase: require('../schemas/OneTimePurchase.json'),
    PriceCap: require('../schemas/PriceCap.json'),
    Product: require('../schemas/Product.json'),
    Vendor: require('../schemas/Vendor.json'),
    WebAddress: require('../schemas/WebAddress.json')
};

function _loadSchemas() {
    for (var schemaName in schemas) {
        tv4.addSchema(schemaName + '.json', schemas[schemaName]);
    }
}

function listValidTypes() {
    var types = [];
    for (var schemaName in schemas) {
        types.push(schemas[schemaName].schemaType);
    }
    return types;
}

function validate(data) {
    if (data === undefined) {
        throw new Error('Validator.validate(data) requires data');
    }
    if (data.type === undefined) {
        throw new Error('Validator.validate(data) data requires type');
    }
    if (listValidTypes().indexOf(data.type) < 0) {
        throw new Error('Validator.validate(data) unrecognized type "' + data.type + '"');
    }

    var deferred = Q.defer();
    _loadSchemas();
    var result = tv4.validateResult(data, schemas[data.type]);
    if (result.error) {
        deferred.reject( data.type + ' validation error: ' + result.error );
    }
    else {
        deferred.resolve();
    }
    return deferred.promise;
}

module.exports = {
    list: listValidTypes,
    validate: validate
};
