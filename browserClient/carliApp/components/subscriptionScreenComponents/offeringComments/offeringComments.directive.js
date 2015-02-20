angular.module('carli.subscriptionScreenComponents.offeringComments')
.directive('offeringComments', function(){
    return {
        restrict: 'E',
        templateUrl: '/carliApp/components/subscriptionScreenComponents/offeringComments/offeringComments.html',
        scope: {
            offering: '=',
            editMode: '='
        },
        controller: offeringCommentsController,
        controllerAs: 'vm',
        bindToController: true
    };
});