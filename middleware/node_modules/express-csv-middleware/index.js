'use strict';
var bodyParser = require('body-parser');
var csv = require('csv');

var DEFAULT_TYPE = 'text/csv';

module.exports = function (textOptions, csvOptions) {
  if (!textOptions) {
    textOptions = {};
  }
  textOptions.type = textOptions.type || DEFAULT_TYPE;
  var textMiddleware = bodyParser.text(textOptions);

  var csvResponse = function csvResponse(content) {
    var _this = this;
    csv.stringify(content, function (err, stringified) {
      if (err) {
        return _this.status(500).send(err.message);
      }
      _this.set('Content-Type', 'text/csv').send(stringified);
    });
  };

  return function (req, res, next) {
    res.csv = csvResponse;

    textMiddleware(req, res, function (err) {
      if (err || Object.prototype.toString.call(req.body) !== '[object String]') {
        return next(err);
      }

      csv.parse(req.body, csvOptions || {}, function (err, parsed) {
        if (err) {
          return next(err);
        }
        req.body = parsed;
        next();
      });
    });
  };
};
