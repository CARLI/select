angular.module('vendor.siteLicenseReactWrapper')
    .controller('siteLicenseReactWrapperController', siteLicenseReactWrapperController);

function siteLicenseReactWrapperController(authService, cycleService) {
    var vm = this;
    vm.user = authService.getCurrentUser();
    vm.cycle = cycleService.getCurrentCycle();
}