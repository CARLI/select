angular.module('common.controllerBaseService')
    .service('controllerBaseService', controllerBaseService);


function controllerBaseService( ) {

    return {
        addSortable: addSortable
    };

    function addSortable( controller, defaultSort ){
        controller.orderBy = controller.orderBy || defaultSort;
        controller.reverse = false;

        controller.sort = function sort( newOrderBy ){
            if ( !newOrderBy ){
                return;
            }

            const currentOrderByString = JSON.stringify(controller.orderBy);
            const newOrderByString = JSON.stringify(newOrderBy);
            if ( currentOrderByString === newOrderByString ){
                controller.reverse = !controller.reverse;
            }
            else {
                controller.orderBy = newOrderBy;
                controller.reverse = false;
            }
        };
    }
}