angular.module('carli.sections.styleGuide')
    .controller('styleGuideController', styleGuideController);

function styleGuideController(componentExamples, componentGatherer) {
    var vm = this;
    var basePath = '/carliApp/sections/styleGuide/examples/';

    vm.components = componentGatherer.gather(componentExamples, basePath);
    vm.exampleCycleList = [
        {
            name: "Example Cycle 1",
            status: "Pending"
        },
        {
            name: "Example Cycle 2",
            status: "Open"
        },
        {
            name: "Example Cycle 3",
            status: "Closed"
        }
    ];

    vm.exampleVendors = [
        {
            name: "Active Vendor 1",
            isActive: true
        },
        {
            name: "Active Vendor 2",
            isActive: true
        },
        {
            name: "Inactive Vendor 3",
            isActive: false
        }
    ];

    vm.exampleContact = {
        name: "Hal 9000",
        email: "hal@uiuc.edu",
        phoneNumber: "333-4444"
    };

    vm.activeFilterState = "All";
}
