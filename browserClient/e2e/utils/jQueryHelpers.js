/**
 * This is not a node module, it is meant to be loaded in the app so that all of these helper definitions are available.
 * The Protractor `browser.executeScript` takes a single stringified function, so this would have to be inside one
 * monstrous function if it were loaded by the Protractor tests.
 */

(function ( window, undefined ) {
    var CARLI = window.CARLI || {};
    CARLI.test = {

        ensureInputIsPresentAndBlank: function( config ){
            return inputIsBlank( config );
        }
    };


    /**
     * Find a View-Edit component by
     * @param config
     * {
     *   model: the value of the ng-model attribute
     * }
     */
    function getViewEditComponentForConfig( config ){
        return $('[ng-model="' + config.model + '"]');
    }

    /**
     * Get the underlying input for a View-Edit component, by Angular ng-model
     * @param config
     * {
     *   model: the value of the ng-model attribute
     *   type: the input type (e.g. 'input', 'select', 'textarea', etc.)
     * }
     */
    function getViewEditInputForConfig( config ){
        var viewEditComponent = getViewEditComponentForConfig(config);

        if ( viewEditComponent ){
            return viewEditComponent.find(config.type);
        }
        else {
            return null;
        }
    }

    function inputIsBlank( config ) {
        var input = getViewEditInputForConfig(config);

        if ( !input ){
            return 'inputIsBlank: component not found with ng-model: '+config.model;
        }

        switch (config.type) {
            case 'input':
            case 'textarea':
                return input.val() === '';
                break;
            case 'checkbox':
                return !input.is(':checked');
                break;
            case 'select':
                return input.val() === '?'; //because that's the default Angular thing...
                break;
            case 'radio':
                return true; //TODO: check default state
                break;
            default:
                return 'inputIsBlank unknown type: ' + config.type;
        }
    }

})( window );


