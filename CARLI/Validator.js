var tv4 = require('tv4');
var formats = require('tv4-formats');
var Q = require( 'q' );
var _ = require('lodash');

tv4.addFormat(formats);

var schemas = {
    ActivityLogEntry: require('../schemas/ActivityLogEntry.json'),
    Cycle: require('../schemas/Cycle.json'),
    CycleCreationJob: require('../schemas/CycleCreationJob.json'),
    CycleType: require('../schemas/CycleType.json'),
    Date: require('../schemas/Date.json'),
    InstitutionType: require('../schemas/InstitutionType.json'),
    InstitutionYears: require('../schemas/InstitutionYears.json'),
    Library: require('../schemas/Library.json'),
    LibraryContact: require('../schemas/LibraryContact.json'),
    LibraryNonCrm: require('../schemas/LibraryNonCrm.json'),
    LibraryStatus: require('../schemas/LibraryStatus.json'),
    License: require('../schemas/License.json'),
    MembershipLevel: require('../schemas/MembershipLevel.json'),
    Membership: require('../schemas/Membership.json'),
    Notification: require('../schemas/Notification.json'),
    NotificationTemplate: require('../schemas/NotificationTemplate.json'),
    NotificationType: require('../schemas/NotificationType.json'),
    Offering: require('../schemas/Offering.json'),
    PriceCap: require('../schemas/PriceCap.json'),
    Pricing: require('../schemas/Pricing.json'),
    Product: require('../schemas/Product.json'),
    ProductDetailCodes: require('../schemas/ProductDetailCodes.json'),
    ProductLicenseType: require('../schemas/ProductLicenseType.json'),
    user: require('../schemas/user.json'),
    UserResetRequest: require('../schemas/UserResetRequest.json'),
    Vendor: require('../schemas/Vendor.json'),
    VendorContact: require('../schemas/VendorContact.json'),
    VendorStatus: require('../schemas/VendorStatus.json')
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
        deferred.reject(result.error.message + ':' + result.error.dataPath);
    }
    else {
        deferred.resolve();
    }
    return deferred.promise;
}

function getEnumValuesFor( type, property ){
    if (type === undefined){
        throw new Error('Type Required');
    }

    if (!schemas[type]){
        throw new Error('Unknown Type');
    }

    var schema = schemas[type];

    if ( schema.enum ){
        return schemas[type]['enum'];
    }
    else if (property === undefined){
        throw new Error('Property Required');
    }

    return schema['properties'][property]['enum'];
}

function listNonIdPropertiesFor( schemaType ){
    var schema = schemas[schemaType];
    var properties = Object.keys(schema.properties);

    return properties.filter(function(prop) {
        return prop != 'id';
    });
}

function getNonIdPropertyMapFor( schemaType ){
    var result = {};
    var schema = schemas[schemaType];
    var propertyNames = listNonIdPropertiesFor(schemaType);

    propertyNames.forEach(function(propertyName) {
        var property = schema.properties[propertyName];
        if ( !property.enum ) {
            if ( property['$ref'] === './Date.json' || property['$ref'] === 'Date.json' ){
                result[propertyName] = 'date';
            }
            else {
                result[propertyName] = schema.properties[propertyName].type;
            }
        }
    });

    return result;
}

function getRequiredPropertiesFor( schemaType ){
    var schema = schemas[schemaType];
    return _.clone(schema.required);
}

module.exports = {
    list: listValidTypes,
    validate: validate,
    getEnumValuesFor: getEnumValuesFor,
    listNonIdPropertiesFor: listNonIdPropertiesFor,
    getNonIdPropertyMapFor: getNonIdPropertyMapFor,
    getRequiredPropertiesFor: getRequiredPropertiesFor
};
