
var static = require('node-static');
var file = new static.Server('.');

var port = 8001;

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(port);

console.log("Listening on http://localhost:" + port + "/bower_components/docson/index.html");
