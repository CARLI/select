var express = require('express');
var docserver = require('docserver');

var port = 8002;

var app = express();
app.use(docserver({
        dir: __dirname,
        url: '/',
        watch: true
    }
));
app.listen(port);

console.log(docserver.version + ' listening on http://localhost:' + port);
