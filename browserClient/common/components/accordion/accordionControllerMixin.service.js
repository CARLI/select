angular.module('common.accordion')
    .factory('accordionControllerMixin', accordionControllerMixin);

function accordionControllerMixin() {
    return function (controller, accordionContentPromiseGetter) {

        controller.openAccordion = null;
        controller.anyFormsHaveUnsavedChanges = anyFormsHaveUnsavedChanges;
        controller.toggleAccordion = toggleAccordion;
        controller.warnIfUnsavedBeforeUnload = warnIfUnsavedBeforeUnload;
        controller.warnIfUnsavedBeforeLocationChange = warnIfUnsavedBeforeLocationChange;

        function anyFormsHaveUnsavedChanges(){
            return $('.content form.ng-dirty').length > 0;
        }

        function toggleAccordion( entity ){
            var userSelectedCurrentlyOpenAccordion = controller.openAccordion === entity.id;

            if ( confirmCloseAccordion() ) {
                closeAccordion();

                if ( !userSelectedCurrentlyOpenAccordion ){
                    getContentThenOpenAccordion();
                }
            }

            function confirmCloseAccordion() {
                if (!accordionIsOpen()) {
                    return true;
                }
                if ( !formsAreDirty() ) {
                    return true;
                }
                return confirm("You have unsaved changes that will be lost if you continue.");

                function accordionIsOpen() {
                    return controller.openAccordion ? true : false;
                }

                function formsAreDirty() {
                    return controller.anyFormsHaveUnsavedChanges();
                }
            }

            function closeAccordion() {
                controller.openAccordion = null;
            }

            function getContentThenOpenAccordion() {
                return accordionContentPromiseGetter(entity)
                    .then(function (passthrough) {
                        controller.openAccordion = entity.id;
                        return passthrough;
                    }).then(function () {
                        setTimeout(function() {
                            scrollToEntity(entity);
                        }, 100);
                    });
            }
        }

        function warnIfUnsavedBeforeUnload() {
            if ( anyFormsHaveUnsavedChanges() ){
                return "You have unsaved changes that will be lost if you continue.";
            }
        }

        function warnIfUnsavedBeforeLocationChange(event, next, current) {
            if ( anyFormsHaveUnsavedChanges() ){
                if ( !confirm("You have unsaved changes that will be lost if you continue.") ) {
                    event.preventDefault();
                }
            }
        }

        function scrollToEntity(entity) {
            var topOfAccordion = $('#scroll-to-' + entity.id).position().top;
            //$('body').scrollTop(topOfAccordion);
            $('html, body').animate({
                scrollTop: topOfAccordion + 'px'
            }, 'fast');
        }
    };
}
