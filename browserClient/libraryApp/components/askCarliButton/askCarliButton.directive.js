angular.module('library.askCarliButton')
.directive('askCarliButton', function(askCarliService){
    return {
        restrict: 'E',
        template: '<button type="button" class="carli-button ask-button">Ask CARLI <fa name="question-circle"></fa></button>',
        scope: {},
        link: linkAskCarliButton
    };

    function linkAskCarliButton(scope, element, attributes){
        var context = 'None';

        attributes.$observe('context', function(value) {
            context = value;
        });

        element.on('click', function(){
            scope.$apply(function(){
                askCarliService.sendStartDraftMessage(context);
            });
        });
    }
});