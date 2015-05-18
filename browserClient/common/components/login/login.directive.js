angular.module('common.login')
    .directive('login', function() {
        return {
            restrict: 'E',
            template: '/common/components/login.html'
        }
    });
