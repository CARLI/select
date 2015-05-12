angular.module('common.config')
.factory('config', function( $window ){
    return $window.CARLI.config;
});
