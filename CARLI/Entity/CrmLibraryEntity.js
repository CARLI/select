var uuid  = require( 'node-uuid' )
  , Q = require( 'q' )
  , crmQueries = require('../../config/environmentDependentModules/crmQueries')
  , entityCache = require('./entityCache')
  , config = require( '../../config' )
;

module.exports = function (timeout) {

    if (timeout === undefined) {
        timeout = config.defaultEntityCacheTimeToLive;
    }
    var cache = entityCache.createCache(timeout);

    var noop = function(){};

    return {
        setStore: noop,
        create: noop,
        update: noop,
        delete: noop,

        list: function() {
            return crmQueries.listLibraries();
        },

        load: function( id ){
            if ( !id ){
                throw new Error('Id Required');
            }

            function loadLibrary(id){
                return crmQueries.loadLibrary(id).then(function(library){
                    library.id = library.crmId.toString();
                    return library;
                });
            }

            var data = cache.get(id) ? cache.get(id) : loadLibrary(id);
            cache.add(data);
            return data;
        }
    };

};
