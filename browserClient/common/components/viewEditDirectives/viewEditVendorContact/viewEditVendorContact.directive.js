angular.module('common.viewEditDirectives.viewEditVendorContact')
    .directive('viewEditVendorContact', function () {
        return {
            restrict: 'E',
            template: [
                '<div class="edit-contact" ng-show="editMode">',
                '  <div class="form-group">',
                '    <label for="{{ inputId }}Name">Name</label>',
                '    <input type="text" name="contactName" ng-model="contact.name" id="{{ inputId }}Name">',
                '  </div>',
                '  <div class="form-group">',
                '    <label for="{{ inputId }}Email">Email</label>',
                '    <input type="text" name="contactName" ng-model="contact.email" id="{{ inputId }}Email">',
                '  </div>',
                '  <div class="form-group">',
                '    <label for="{{ inputId }}Phone">Phone</label>',
                '    <input type="text" name="contactName" ng-model="contact.phoneNumber" id="{{ inputId }}Phone">',
                '  </div>',
                '</div>',
                '<div class="view-contact" ng-show="!editMode">',
                '  <div class="contact-name">{{ contact.name }}</div>',
                '  <div class="contact-contact-methods">',
                '    <a class="contact-phone" href="tel:{{ contact.phoneNumber }}">{{ contact.phoneNumber }}</a>',
                '    <a class="contact-email" href="mailto:{{ contact.email }}">{{ contact.email }}</a>',
                '  </div>',
                '</div>'
            ].join(''),
            scope: {
                contact: '=',
                editMode: '=',
                inputId: '@'
            }
        };
    });
