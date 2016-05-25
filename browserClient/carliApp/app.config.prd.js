/**
 * See: https://code.angularjs.org/1.3.19/docs/guide/production#disabling-debug-data
 * In browser console, run the following to enable inline scope debugging classes:
 * angular.reloadWithDebugInfo();
 */
angular.module('carli.app')
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);
