var uuid  = require( 'node-uuid' )
  , tv4   = require( 'tv4' )
  , Validator = require( '../Validator' )
  , Q = require( 'q' )
  , entityCache = require('./entityCache')
  , config = require( '../../config' )
;

function throwIfDataIsEmpty ( data ) {
    if ( !data ){
        throw new Error( 'Data Required' );
    }
}

function validateCreateData( data ){
    throwIfDataIsEmpty( data );
}

function validateUpdateData( data ){
    throwIfDataIsEmpty( data );
    if ( !data.id ){
        throw new Error( 'Id Required' );
    }
    validateCreateData( data );
}

function _cloneData ( data ) {
    return JSON.parse( JSON.stringify( data ) );
}

module.exports = function (type, timeout) {
    var dataStore;
    if (timeout === undefined) {
        timeout = config.defaultEntityCacheTimeToLive;
    }
    var cache = entityCache.createCache(timeout);
    return {

        setStore: function( store ){
            dataStore = store;
        },

        create: function( originalData, transformFunction ) {
            validateCreateData( originalData );

            var data = _cloneData( originalData );

            data.id = data.id || uuid.v4();
            data.type = type;

            if ( transformFunction && typeof(transformFunction) === 'function' ){
                transformFunction(data);
            }

            var deferred = Q.defer();

            Validator.validate( data )
            .then( function() {
                return dataStore.save( data )
            } )
            .then( function( savedData ) {
                deferred.resolve( data.id );
            } )
            .catch( function( err ) {
                deferred.reject( err );
            } );
            return deferred.promise;
        },

        update: function( originalData, transformFunction ){
            validateUpdateData( originalData );
            cache.delete(originalData.id);

            var data = _cloneData( originalData );

            if ( transformFunction && typeof(transformFunction) === 'function' ){
                transformFunction(data);
            }

            var deferred = Q.defer();

            Validator.validate( data )
            .then( function() {
                return dataStore.save( data )
            } )
            .then( function( savedData ) {
                deferred.resolve( data.id );
            } )
            .catch( function( err ) {
                deferred.reject( err );
            } );
            return deferred.promise; 
        },

        list: function(collection) {
            return dataStore.list( type, collection );
        },

        load: function( id ){
            if ( !id ){
                throw new Error('Id Required');
            }
            var data = cache.get(id) ? cache.get(id) : dataStore.get(id);
            cache.add(data);
            return data;
        },

        delete: function( id ){
            if ( !id ){
                throw new Error('Id Required');
            }
            cache.delete(id);
            return dataStore.delete( id );
        }

    };

};

