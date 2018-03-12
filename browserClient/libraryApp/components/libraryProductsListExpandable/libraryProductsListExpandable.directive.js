angular.module('library.libraryProductsListExpandable')
    .directive('libraryProductsListExpandable', function() {
        return {
            restrict: 'E',
            templateUrl: '/libraryApp/components/libraryProductsListExpandable/libraryProductsListExpandable.html',
            scope: {
                cycle: '=',
                libraryId: '@',
                licenseOnClick: '='
            },
            controller: 'libraryProductsListExpandableController',
            controllerAs: 'vm',
            bindToController: true,
            link: libraryProductsListExpandableLink
        };

        function libraryProductsListExpandableLink( scope, element, attrs, controller ){
            element.on('click', '.product-list li.product .column.license', function(e){
                var licenseId = $(this).data('licenseId');
                if ( controller.licenseOnClick ){
                    scope.$apply(function(){
                        controller.licenseOnClick(licenseId);
                    });
                }
            });
        }
    });
