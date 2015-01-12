var mysql = require('mysql');
var config = require('../config');
var LibraryRepository = require('../Entity/LibraryRepository');
var Q = require('q');

function extractRowsFromResponse(err, rows) {
    if (err) {
        throw new Error(err);
    }

    var returnRows = [];

    if (rows) {
        rows.forEach(function (row) {
            returnRows.push(row);
        });
        return returnRows;
    }

    return false;
}

function main() {
    var connection = mysql.createConnection(config.memberDb);
    connection.connect();


    connection.end();
}

function listLibraries() {
    var deferred = Q.defer();
    var connection = mysql.createConnection(config.memberDb);
    connection.connect();

    connection.query(
        'SELECT * FROM members',
        null,
        function(err, rows, fields) {
            var libraries = extractRowsFromResponse(err, rows);
            deferred.resolve(libraries);
        }
    );

    connection.end();

    return deferred.promise;
}

module.exports = {
    listLibraries: listLibraries
};
