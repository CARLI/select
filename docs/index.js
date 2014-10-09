var express = require('express');
var docserver = require('docserver');

var app = express();
app.use(docserver({
        dir: __dirname,
        url: '/',
        watch: true
    }
));
app.listen(3000);

console.log(docserver.version + ' listening on http://localhost:3000');
