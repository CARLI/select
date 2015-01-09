angular.module('carli.warnIfUnsaved')
    .directive('warnIfUnsaved', warnIfUnsaved);

    function warnIfUnsaved( $rootScope ) {
        return {
            restrict: 'A',
            scope: {
                warnIfUnsaved: '@'
            },
            link: function($scope, elem, attrs) {

                var formName = elem.attr('name');

                $scope.$watch( function() {
                    return $scope.$parent[formName];
                }, function(newValue, oldValue) {
                    $rootScope.forms = $rootScope.forms || {};
                    $rootScope.forms[formName] = newValue;
                });

                $(window).bind('beforeunload', function(){
                    if ( formHasUnsavedChanges(formName) ){
                        return "You have unsaved changes that will be lost if you continue.";
                    }
                });

                $scope.$on('$locationChangeStart', function(event, next, current) {
                    if ( formHasUnsavedChanges(formName) ){
                        if ( !confirm("You have unsaved changes that will be lost if you continue.") ) {
                            event.preventDefault();
                        }
                    }
                });
            }
        };

        function formHasUnsavedChanges( formName ){
            return $rootScope.forms[formName].$dirty;
        }
    }
