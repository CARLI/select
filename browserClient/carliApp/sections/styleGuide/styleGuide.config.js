angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
        'carli.alerts',
        'carli.viewEditDirectives',
        'carli.goodSelect',
        'carli.checkbox',
        'carli.radio',
        'carli.warnIfUnsaved'
    ]
)
    .value('componentExamples', {
        'Alerts': 'alerts.html',
        'Buttons': 'buttons.html',
        'Checkbox': 'checkbox.html',
        'Radio': 'radio.html',
        'Select': 'select.html',
        'Filter by Active': 'filter-active.html',
        'View Edit Contact': 'view-edit-contact.html',
        'View Edit Text Field': 'view-edit-text-field.html',
        'View Edit Text Area': 'view-edit-text-area.html',
        'View Edit Number Field ': 'view-edit-number-field.html',
        'View Edit Checkbox ': 'view-edit-checkbox.html',
        'View Edit Yes/No/Other': 'view-edit-yes-no-other.html',
        'View Edit Date': 'view-edit-date.html',
        'Warning for Unsaved Form Changes': 'warn-if-unsaved.html'
    });
