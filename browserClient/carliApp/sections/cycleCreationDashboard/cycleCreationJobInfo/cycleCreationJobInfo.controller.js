angular.module('carli.sections.cycleCreationDashboard.cycleCreationJobInfo')
    .controller('cycleCreationJobInfoController', cycleCreationJobInfoController);

function cycleCreationJobInfoController(cycleCreationJobService) {
    var vm = this;
    vm.resumeJob = resumeJob;
    window.t = this;

    activate();
    function activate() {
    }

    function resumeJob() {
        if (vm.job && vm.job.id) {
            cycleCreationJobService.resumeCycle(vm.job.id);
        }
        else
        {
            console.log("error trying to find the target cycle or id on resume");
        }
        return delayTwoSeconds();
    }

    function delayTwoSeconds() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }
}
