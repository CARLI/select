angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
        'carli.mainMenu',
        'carli.cycleStatus'
    ]
)
    .value('componentExamples', {
        'Cycle Status': 'cycle-status.html',
        'Filter by Active': 'filter-active.html'
    });
