angular.module('carli.sections.styleGuide',
    [
        'carli.componentGatherer',
        'common.alerts',
        'carli.entityList',
        'common.fa',
        'common.viewEditDirectives',
        'common.goodSelect',
        'common.checkbox',
        'common.radio',
        'common.warnIfUnsaved'
    ]
)
    .value('componentExamples', {
        'Alerts': 'alerts.html',
        'Buttons': 'buttons.html',
        'Checkbox': 'checkbox.html',
        'Radio': 'radio.html',
        'Select': 'select.html',
        'Filter by Active': 'filter-active.html',
        'View Edit Checkbox ': 'view-edit-checkbox.html',
        'View Edit Contact': 'view-edit-contact.html',
        'View Edit Date': 'view-edit-date.html',
        'View Edit Integer ': 'view-edit-integer.html',
        'View Edit Price ': 'view-edit-price.html',
        'View Edit Percentage Field ': 'view-edit-percentage-field.html',
        'View Edit Radio Buttons': 'view-edit-radios.html',
        'View Edit Select': 'view-edit-select.html',
        'View Edit Text Area': 'view-edit-text-area.html',
        'View Edit Text Field': 'view-edit-text-field.html',
        'View Edit Typeahead': 'view-edit-typeahead.html',
        'View Edit Yes/No/Other': 'view-edit-yes-no-other.html',
        'Entity List': 'entity-list.html',
		'Warning for Unsaved Form Changes': 'warn-if-unsaved.html'
    });
