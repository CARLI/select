angular.module('carli.sections.styleGuide')
    .controller('styleGuideController', function (componentExamples, componentGatherer) {
        var basePath = '/carliApp/sections/styleGuide/examples/';
        this.components = componentGatherer.gather(componentExamples, basePath);
        this.exampleCycleList = [
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

        this.exampleVendors = [
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

        this.exampleContact = {
            name: "Hal 9000",
            email: "hal@uiuc.edu",
            phoneNumber: "333-4444"
        };

        this.activeFilterState = "All";
    });
