angular.module('carli.config')
.factory('config', function( $window ){
    return $window.CARLI.config;
});
