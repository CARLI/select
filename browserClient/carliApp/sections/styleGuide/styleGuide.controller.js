angular.module('carli.sections.styleGuide')
    .controller('styleGuideController', function (componentExamples, componentGatherer) {
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

        vm.activeFilterState = "All";
    });
