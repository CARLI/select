angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
        'carli.alerts',
        'carli.viewEditDirectives',
        'carli.goodSelect',
        'carli.checkbox',
        'carli.radio'
    ]
)
    .value('componentExamples', {
        'Alerts': 'alerts.html',
        'Buttons': 'buttons.html',
        'Checkbox': 'checkbox.html',
        'Filter by Active': 'filter-active.html',
        'View Edit Checkbox ': 'view-edit-checkbox.html',
        'View Edit Contact': 'view-edit-contact.html',
        'View Edit Date': 'view-edit-date.html',
        'View Edit Number Field ': 'view-edit-number-field.html',
        'View Edit Percentage Field ': 'view-edit-percentage-field.html',
        'Radio': 'radio.html',
        'Select': 'select.html',
        'View Edit Text Area': 'view-edit-text-area.html',
        'View Edit Text Field': 'view-edit-text-field.html',
        'View Edit Typeahead': 'view-edit-typeahead.html',
        'View Edit Yes/No/Other': 'view-edit-yes-no-other.html'
    });
