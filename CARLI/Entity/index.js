var uuid  = require( 'node-uuid' )
  , tv4   = require( 'tv4' )
  , Validator = require( '../Validator' )
;

var dataStore;

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

module.exports = function (type) {
    return {

        setStore: function( store ){
            dataStore = store;
        },

        create: function( data ) {
            validateCreateData( data );

            data.id = data.id || uuid.v4();
            data.type = type;

            var deferred = Q.defer();

            Validator.validate( data )
            .then( function() {
                return dataStore.save( data )
            } )
            .then( function( id ) {
                deferred.resolve( _cloneData( data ) );
            } )
            .catch( function( err ) {
                deferred.reject( err );
            } );
            return deferred.promise;
        },

        update: function( data ){
            validateUpdateData( data );
            var deferred = Q.defer();
            Validator.validate( data )
            .then( function() {
                return dataStore.save( data )
            } )
            .then( function( id ) {
                deferred.resolve( _cloneData( data ) );
            } )
            .catch( function( err ) {
                deferred.reject( err );
            } );
            return deferred.promise; 
        },

        list: function() {
            return dataStore.list( type );
        },

        load: function( id ){
            if ( !id ){
                throw new Error('Id Required');
            }
            return dataStore.get( { id: id, type: type } );
        }
    };
};

