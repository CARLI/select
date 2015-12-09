angular.module('vendor.historicPricingModal')
    .directive('historicPricingModal', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/historicPricingModal/historicPricingModal.html',
            scope: {
                showing: '=',
                currentYear: "=",
                offerings: "="
            },
            controller: 'historicPricingModalController',
            controllerAs: 'vm',
            bindToController: true,
            link: historicPricingModalLink
        };

        function historicPricingModalLink(scope, element, attributes){
            element.on('hide.bs.modal', modalClosing);

            function modalClosing(event){
                scope.$apply(function(){
                    scope.vm.showing = false;
                });
            }
        }
    });
