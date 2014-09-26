/**
 * @name Carli Service
 * @ngdoc service
 * @description 
 * ## External Code ##
 * This service exists solely to import the packaged CARLI code into the Angular app.
 * All the code under CARLI/ is bundled using Browserify and exposed via a global variable
 * **window.Carli**, which this service returns. 
 *
 */
angular.module('carli.service')
.factory('Carli', function(){
    return window.Carli;
});
