angular.module('carli.warnIfUnsaved')
    .directive('warnIfUnsaved', warnIfUnsaved);

    function warnIfUnsaved() {
        return {
            restrict: 'A',
            scope: true,
            link: function($scope, elem, attrs) {
                var formName  = elem.attr('name');

                $(window).bind('beforeunload', function(){
                    if ( $scope[formName].$dirty ){
                        return "You have unsaved changes that will be lost if you continue.";
                    }
                });
            }
        };
    }

