angular.module('common.scrollTo')
.directive('scrollTo', function($window){
    return {
        restrict: 'A',
        link: linkScrollTo
    };

    function linkScrollTo(scope, element, attributes){
        var idOfElementToScrollTo = attributes.scrollTo;

        element.on('click', function(){
            scrollTo(idOfElementToScrollTo);
        });

        function scrollTo( id ){
            var el = $('#'+id);

            if ( el.length ){
                el[0].scrollIntoView();
            }
        }
    }
});