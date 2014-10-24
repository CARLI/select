angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
    ]
)
    .value('componentExamples', {
        'Filter by Active': 'filter-active.html',
        'Contact Editor': 'contact-editor.html'
    });
