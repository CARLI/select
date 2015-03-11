angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .directive('librariesSelectingProductsByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/librariesSelectingProducts/librariesSelectingProductsByLibrary.html',
            scope: {},
            controller: 'librariesSelectingProductsByLibraryController',
            controllerAs: 'vm',
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            function anyFormsHaveUnsavedChanges(){
                return $('.content form.ng-dirty').length > 0;
            }
            
            controller.anyFormsHaveUnsavedChanges = anyFormsHaveUnsavedChanges;

            $(window).bind('beforeunload', function(){
                if ( anyFormsHaveUnsavedChanges() ){
                    return "You have unsaved changes that will be lost if you continue.";
                }
            });

            scope.$on('$locationChangeStart', function(event, next, current) {
                if ( anyFormsHaveUnsavedChanges() ){
                    if ( !confirm("You have unsaved changes that will be lost if you continue.") ) {
                        event.preventDefault();
                    }
                }
            });
        }
    });
