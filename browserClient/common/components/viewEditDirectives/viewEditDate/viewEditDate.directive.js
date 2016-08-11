angular.module('common.viewEditDirectives.viewEditDate')
    .directive('viewEditDate', function () {
        return {
            restrict: 'E',
            template: [
                '<div ng-show="editMode">',
                '  <input type="text"',
                '    datepicker-popup="{{format}}"',
                '    ng-model="ngModel"',
                '    is-open="opened"',
                '    show-weeks="false"',
                '    show-button-bar="false"',
                '    min-date="minDate"',
                '    max-date="maxDate"',
                '    datepicker-options="dateOptions"',
                '    close-text="Close"',
                '    id="{{ inputId }}" />',
                '  <div class="warning">Invalid date will not be saved.</div>',
                '  <fa name="calendar" ng-click="open($event)"></fa>',
                '</div>',
                '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                label: '@',
                inputId: '@',
                minDate: '@',
                maxDate: '@'
            },
            transclude: true,
            controller: 'viewEditDateController',
            controllerAs: 'vm'
        };
    });
