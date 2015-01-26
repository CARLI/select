angular.module('carli.fa')
.directive('fa', function () {
    return {
        restrict: 'E',
        template: '<span class="fa"></span>',
        replace: true,
        scope: {
            name: '@'
        },
        link: function (scope, element, attrs) {
            var className = 'fa-' + scope.name;
            element.addClass(className);
		}
    };
});