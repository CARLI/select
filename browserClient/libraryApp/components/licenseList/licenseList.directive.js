angular.module('library.licenseList')
    .directive('licenseList', function(){
        return {
            restrict: 'E',
            template: [
                '<div class="label purple">Redacted License Agreement(s)</div>',
                '<ul cg-busy="vm.loadingPromise">',
                '  <li ng-repeat="file in vm.files | orderBy:vm.orderBy">',
                '    <a ng-href="{{ file.link }}" class="file" target="_blank">{{ file.name }}</a>',
                '  </li>',
                '</ul>'
            ].join(''),
            scope: {
                licenseId: '='
            },
            controller: 'licenseListController',
            controllerAs: 'vm',
            bindToController: true
        };
    });