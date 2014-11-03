angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
        'carli.viewEditDirectives.viewEditContact',
        'carli.viewEditDirectives.viewEditTextField',
        'carli.viewEditDirectives.viewEditTextArea'
    ]
)
    .value('componentExamples', {
        'Filter by Active': 'filter-active.html',
        'View Edit Contact': 'view-edit-contact.html',
        'View Edit Text Field': 'view-edit-text-field.html',
        'View Edit Text Area': 'view-edit-text-area.html'
    });
