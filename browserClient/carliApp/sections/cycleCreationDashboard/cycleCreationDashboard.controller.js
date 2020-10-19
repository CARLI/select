angular.module('carli.sections.cycleCreationDashboard')
    .controller('cycleCreationDashboardController', cycleCreationDashboardController);

function cycleCreationDashboardController($scope, activityLogService, alertService, cycleCreationJobService, errorHandler, persistentState) {
    var vm = this;
    vm.jobsLoading = null;
    vm.activeJobs = [];
    vm.resumeJob = resumeJob;

    activate();

    function activate() {

            /*
            errors look like
            [
                { timestamp: '2020-09-21-14:42:00', message: 'Yaaaaaa" },
                { timestamp: '2020-09-21-14:42:00', message: 'Yaaaaaa" },
                { timestamp: '2020-09-21-14:42:00', message: 'Yaaaaaa" },
            ]
             */
        vm.jobsLoading = cycleCreationJobService.list()
            .then(function (allJobs) {
                vm.activeJobs = allJobs.map(job => {
                    const jobStatus = cycleCreationJobService.getStatusForJob(job);
                    return {
                        ...job,
                        status: jobStatus,
                        canResume: jobStatus !== "Completed",
                        concatenatedLogMessages: concatenateLogMessages(job.logMessages)
                    };
                });
            });

        return vm.jobsLoading;
    }

    function concatenateLogMessages(messages) {
        if(!messages)
            return null;

        for(let i = 0; i < 10; i++)
            messages = messages.concat(messages);

        const formattedMessages = messages.map(message => {
            return `[${message.timestamp}] - ${message.message}`;
        });

        return formattedMessages.join('\n');
    }

    function resumeJob(job) {
        if (job && job.id) {
            cycleCreationJobService.resumeCycle(job.id);
        }
        else
        {
            console.log("error trying to find the target cycle or id on resume");
        }
    }
}
