angular.module('carli.manageNotificationTemplatesModal')
.directive('manageNotificationTemplatesModal', function(){
   return {
       restrict: 'E',
       scope: {},
       templateUrl: 'carliApp/components/manageNotificationTemplatesModal/manageNotificationTemplatesModal.html',
       controller: 'manageNotificationTemplatesModalController',
       controllerAs: 'vm',
       bindToController: true
   };
});