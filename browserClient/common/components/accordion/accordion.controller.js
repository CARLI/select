angular.module('common.accordion')
.controller('accordionController', accordionController);

function accordionController($scope) {

    function open() {
        $scope.element.removeClass('collapsed').children('.content').slideDown();
    }

    function close() {
        $scope.element.addClass('collapsed').children('.content').slideUp();
    }

    $scope.$on('accordion', function(evt, id) {

        if ($scope.accordionId === id){
            if ($scope.element.hasClass('collapsed')) {
                open();
            } else {
                close();
            }
        }
        else {
            close();
        }
    });
}