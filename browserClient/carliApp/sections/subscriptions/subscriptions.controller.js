angular.module('carli.sections.subscriptions')
.controller('subscriptionsController', subscriptionsController);

function subscriptionsController(){
    var vm = this;

    activate();
    function activate() {
        addDummyData();
    }

    function addDummyData() {
        vm.cycles = [
            { name: 'Fiscal Year 2015', status: 'Edit Product List' },
            { name: 'Calendar Year 2015', status: 'Products Available to Library Patrons' },
            { name: 'Fiscal Year 2014', status: 'Products Available to Library Patrons' }
        ];
    }
}
