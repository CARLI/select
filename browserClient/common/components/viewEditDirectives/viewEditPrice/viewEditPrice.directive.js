angular.module('common.viewEditDirectives.viewEditPrice')
    .directive('viewEditPrice', function() {
        return {
            restrict: 'E',
            template: [
              '<div ng-show="editMode" ng-class="{ \'is-funded\': fundedPrice }">',
              '  <input class="full-price" type="number" step=".01" ng-model="ngModel" id="{{ inputId }}">',
              '  <span class="funded-price" ng-if="fundedPrice"><span class="funded-label">Funded Price</span>: {{ fundedPrice | currency }}</span>',
              '</div>',
              '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                fundedPrice: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
