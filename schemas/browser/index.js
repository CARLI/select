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
for ( var i = 0 ; i < fileList.length ; i++ ) {
    if ( fileList[i].slice(-5) == '.json' ) {
        processJsonFile( fileList[i] );
    }
}

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(port);

console.log("Listening on http://localhost:" + port + "/bower_components/docson/index.html");
