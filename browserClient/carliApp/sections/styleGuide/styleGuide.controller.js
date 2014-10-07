angular.module('carli.sections.styleGuide')
.controller('styleGuideController', function(){
    this.exampleCycleList = [
        {
            name: "Example Cycle 1",
            status: "Pending"
        },
        {
            name: "Example Cycle 2",
            status: "Open",
        },
        {
            name: "Example Cycle 3",
            status: "Closed"
        }
    ];
});
