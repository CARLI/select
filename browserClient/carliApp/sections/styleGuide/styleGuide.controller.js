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

    });
