angular.module('common.entityBaseService')
    .service('entityBaseService', entityBaseService);


function entityBaseService( CarliModules, $q ) {

    return {
        getStatusOptions: getStatusOptions
    };
}


function getStatusOptions(){
    return [
        {
            label: 'Active',
            value: true
        },
        {
            label: 'Inactive',
            value: false
        }
    ];
}
