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
    var cache = entityCache.getCacheFor('CrmLibrary',timeout);

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
                    library.id = library.crmId;
                    return library;
                });
            }

            var cachedResult = cache.get(id);
            if (!cachedResult) {
                var promise = loadLibrary(id).then(function (data) {
                    return data;
                });
                cache.add({ id: id, promise: promise });
                return promise;
            } else {
                return cachedResult.promise;
            }
        },

        listCrmContactsForLibrary: crmQueries.listCrmContactsForLibrary
    };

};
