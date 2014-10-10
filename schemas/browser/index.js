var fs = require('fs');
var static = require('node-static');
var file = new static.Server('.');

var port = 8001;

function processJsonFile( fileName ) {
    var fileContents = fs.readFileSync('../'+fileName, { encoding: 'utf8'} );

    jsonRefRegex = /"\$ref":\s*"\.\/(.*)\.json"/g;

    newFileContents = fileContents.replace( jsonRefRegex, '"$ref": "http://localhost:'+port+'/$1.json"' );

    fs.writeFileSync( fileName, newFileContents );
}

var fileList = fs.readdirSync('../');
fileList = fileList.filter(function (file) {
    return ( file.slice(-5) == '.json' );
});

fileList.map( function(file){
    processJsonFile( file );
});

indexList = fileList.map( function(file){
    var entityName = file.slice(0,-5);
    return '<a href="#'+file+'">'+entityName+'</a>';
});
fs.writeFileSync('index.json.html', indexList.join(''));


require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(port);

console.log("Listening on http://localhost:" + port + "/");
