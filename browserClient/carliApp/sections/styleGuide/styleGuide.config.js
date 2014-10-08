angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
        'carli.mainMenu',
        'carli.cycleStatus'
    ]
)
    .value('componentExamples', {
        'Cycle Status': 'cycle-status.html'
    });
