/**
 * @name CarliModules Service
 * @ngdoc service
 * @description 
 * ## External Code ##
 * This service exists solely to import the packaged CARLI code into the Angular app.
 * All the code under CARLI/ is bundled using Browserify and exposed via a global variable
 * **window.CARLI**, which this service returns. 
 *
 */
angular.module('common.carliModules')
.factory('CarliModules', function( $window ){
    return $window.CARLI;
});
