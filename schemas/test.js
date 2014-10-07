
var fs = require('fs');
var tv4 = require('tv4');

function addSchema(filename) {
    var schema = JSON.parse(fs.readFileSync(filename, 'utf8'));
    tv4.addSchema(filename, schema);
    return schema;
}

var contactSchema = addSchema('contact.json');
var cycleTypeSchema = addSchema('cycle-type.json');
var priceCapSchema = addSchema('price-cap.json');
var productSchema = addSchema('product.json');
var urlSchema = addSchema('web-address.json');
var vendorSchema = addSchema('vendor.json');

var data = {
    'name': 'Acme',
    'websiteUrl': 'http://acme.com'
};

var result = tv4.validateResult(data, vendorSchema);
console.log(result);

