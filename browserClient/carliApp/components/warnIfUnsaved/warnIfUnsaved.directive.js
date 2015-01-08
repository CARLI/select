angular.module('carli.warnIfUnsaved')
    .directive('warnIfUnsaved', warnIfUnsaved);

    function warnIfUnsaved() {
        return {
            restrict: 'A',
            scope: {},
            link: function($scope, elem, attrs) {
                $(window).bind('beforeunload', function(){
                    if ( formHasUnsavedChanges(elem) ){
                        return "You have unsaved changes that will be lost if you continue.";
                    }
                });

                $scope.$on('$locationChangeStart', function(event, next, current) {
                    if ( formHasUnsavedChanges(elem) ){
                        if ( !confirm("You have unsaved changes that will be lost if you continue.") ) {
                            event.preventDefault();
                        }
                    }
                });
            }
        };
    }

    function formHasUnsavedChanges( formElement ){
        return formElement.hasClass('ng-dirty');
    }