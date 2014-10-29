
var fs = require('fs');
var tv4 = require('tv4');

function validateSchema(filename) {
    var schema = JSON.parse(fs.readFileSync(filename, 'utf8'));
    tv4.addSchema(filename, schema);
    return schema;
}

var fileList = fs.readdirSync('./');
fileList = fileList.filter(function (file) {
    return ( file.slice(-5) == '.json' );
});

fileList.map( function(file){
    validateSchema( file );
});