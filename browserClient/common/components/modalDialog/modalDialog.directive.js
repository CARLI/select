angular.module('common.modalDialog')
    .directive('modalDialog', function() {
        return {
            restrict: 'E',
            template: [
                '<div class="modal" id="{{modalId}}" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">',
                '    <div class="modal-dialog {{ modalClass }}">',
                '        <div class="modal-content">',
                '            <div class="modal-header">',
                '                <button type="button" class="close" data-dismiss="modal"><fa aria-hidden="true" name="remove"></fa><span class="sr-only">Close</span></button>',
                '                <h4 class="modal-title" id="modal-label">{{ modalTitle }}</h4>',
                '            </div>',
                '            <ng-transclude></ng-transclude>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join(''),
            scope: {
                modalTitle: '=',
                modalId: '=',
                modalClass: '@'
            },
            transclude: true
        };
    });
