#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Express middleware that parse text/csv content into array or object.


## Install

```sh
$ npm install --save express-csv-middleware
```


## Usage

```js
var expressCsv = require('express-csv-middleware');

var bodyParserOptions = {
  // https://github.com/expressjs/body-parser#bodyparsertextoptions
};
var csvOptions = {
  // http://csv.adaltas.com/parse/
  // http://csv.adaltas.com/stringify/
};

app.use(expressCsv(bodyParserOptions, csvOptions));

// POST with Content-Type: text/csv
app.post(function(req, res) {
  console.log(req.body);    // [['header', 'row'], ['body', 'rows'], ...]
  app.csv(req.body);        // Respond with Content-Type: text/csv
})

```


## License

MIT © [Greg Wang](gregwym.info)


[npm-image]: https://badge.fury.io/js/express-csv-middleware.svg
[npm-url]: https://npmjs.org/package/express-csv-middleware
[travis-image]: https://travis-ci.org/gregwym/express-csv-middleware.svg?branch=master
[travis-url]: https://travis-ci.org/gregwym/express-csv-middleware
[daviddm-image]: https://david-dm.org/gregwym/express-csv-middleware.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/gregwym/express-csv-middleware
