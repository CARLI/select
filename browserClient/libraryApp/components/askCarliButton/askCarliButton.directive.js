angular.module('library.askCarliButton')
.directive('askCarliButton', function(){
    return {
        restrict: 'E',
        template: '<button type="button" class="carli-button ask-button">Ask CARLI <fa name="question-circle"></fa></button>'
    };
});