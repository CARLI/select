var config = require( './default.js' )
  , dbCredentials = require( './db_credentials.js' );

module.exports = function() {
  return mergeDbCredentials( config, dbCredentials ) ;

  function mergeDbCredentials( config, dbCredentials ) {
    for ( var attr in dbCredentials ) {
      if( dbCredentials.hasOwnProperty( attr ) )
        config.dsn[attr] = dbCredentials[attr];
    }
    return config;
  }
}();
