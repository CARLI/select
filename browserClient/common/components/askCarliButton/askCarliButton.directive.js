angular.module('common.askCarliButton')
.directive('askCarliButton', function(askCarliService, authService){
    return {
        restrict: 'E',
        template: '<button ng-hide="userIsReadOnly()" type="button" class="carli-button ask-button">Ask CARLI <fa name="question-circle"></fa></button>',
        scope: {},
        link: linkAskCarliButton
    };

    function linkAskCarliButton(scope, element, attributes){
        var context = 'None';
        scope.userIsReadOnly = authService.userIsReadOnly;

        attributes.$observe('context', function(value) {
            context = value;
        });

        element.on('click', function(){
            scope.$apply(function(){
                askCarliService.sendStartDraftMessage(context);
            });
        });
    }
})
.directive('askCarli', function(askCarliService){
    return {
        restrict: 'A',
        scope: {},
        link: linkAskCarli
    };

    function linkAskCarli(scope, element, attributes){
        var context = 'None';

        attributes.$observe('askCarli', function(value) {
            context = value;
        });

        element.on('click', function(){
            Logger.log('ask carli click');
            scope.$apply(function(){
                askCarliService.sendStartDraftMessage(context);
            });
        });
    }
});
