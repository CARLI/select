#!/usr/local/bin/node

var CONFIG = require('./config');
var mysql = require('mysql');
var Q = require( 'q' );

var connection = mysql.createConnection( CONFIG.dsn );

connection.connect();

var users = [ 'bdcribbs', 'walters', 'msharkey', 'steve', 'ben', 'terence', 'marty', 'schreiber' ];

function extractRowsFromResponse ( err, rows, fields ) {
  if ( err ) {
    throw new Error( "Bogus: " + err );
  };

  var returnrows = [];

  if( rows ) {
    rows.forEach( function( row ) { 
      returnrows.push( row );
    } );
    return returnrows;
  }

  return false;

};

function getUserIdsFromDatabase() {
  var deferred = Q.defer();
  connection.query(
    'SELECT id FROM worker WHERE email IN ( ? )',
    [users],
    function(err, rows, fields) {
      deferred.resolve(
        extractRowsFromResponse( err, rows, fields )
      )
    }
  );
  return deferred.promise;
};

function getHoursForWorkerInDateRange( workerid, start, end ) {
  var deferred = Q.defer();
  connection.query(
    'SELECT h.workDate, j.name AS JobName, t.name AS TaskName,' +
      'h.hours, h.description ' +
    'FROM hours h INNER JOIN job j ON h.jobid = j.id ' +
    'INNER JOIN task t ON h.taskid = t.id ' +
    'WHERE ' + 
      'h.workerid = ? ' +
      'AND h.workDate >= ? ' +
      'AND h.workDate <= ? ' +
      'AND t.unbilled = "N" ' +
      'AND j.type = "billed" ' +
      'ORDER BY h.workDate;',
    [ workerid, start, end ],
    function( err, rows, fields ) {
      deferred.resolve(
        extractRowsFromResponse( err, rows, fields )
      )
    }
  );
  return deferred.promise;
};


function main() {
  getUserIdsFromDatabase()
    .then( function(data) {
        console.log( data );
    } )
    .catch( function( err ) {
        console.log( "Something went wrong: " + err )
    } );
  getHoursForWorkerInDateRange( 52, '2014-11-16', '2014-11-30' )
    .then( function(data) {
        var totalHours = 0;
        data.forEach( function( thingy ) {
          totalHours += thingy.hours;
        } );
        console.log( data );
        console.log( "Total: " + totalHours );
    } )
    .catch( function( err ) {
        console.log( "Something went wrong: " + err )
    } );
}

main();

connection.end();
