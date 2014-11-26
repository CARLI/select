/**
 * This is not a node module, it is meant to be loaded in the app so that all of these helper definitions are available.
 * The Protractor `browser.executeScript` takes a single stringified function, so this would have to be inside one
 * monstrous function if it were loaded by the Protractor tests.
 */

(function ( window, undefined ) {
    var CARLI = window.CARLI || {};
    CARLI.test = {
        inputHasValue: inputHasValue,
        elementHasText: elementHasText
    };


    function toString( val ){
        var string = ''+val;
        return string.trim();
    }

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
            if ( config.type === 'checkbox' || config.type === 'radio' ){
                return viewEditComponent.find('input[type="'+config.type+'"]');
            }
            return viewEditComponent.find(config.type);
        }
        else {
            return null;
        }
    }

    /**
     * Get the display portion of a View-Edit component, by Angular ng-model
     */
    function getViewEditDisplayForConfig( config ){
        var viewEditComponent = getViewEditComponentForConfig(config);

        if ( viewEditComponent ){
            return viewEditComponent.children(":visible");
        }
        else {
            return null;
        }
    }

    function inputHasValue( config, expectedValue ) {
        var input = getViewEditInputForConfig(config),
            value = '',
            result = false;

        if ( !input ){
            return 'inputHasValue: component not found with ng-model: '+config.model;
        }

        switch (config.type) {
            case 'input':
            case 'textarea':
                value = input.val();
                result = (toString(expectedValue) === value);
                break;
            case 'select':
                value = input.find('option:selected').text();
                result = (toString(expectedValue) === value);
                break;
            case 'checkbox':
                value = input.is(':checked');
                result = ( expectedValue === value );
                break;
            case 'radio':
                value = input.index(input.filter(':checked'));
                result = (value === config.valueToIndex[expectedValue]);
                break;
            default:
                return 'inputHasValue unknown type: ' + config.type;
        }

        if ( result ){
            return true;
        }
        else {
            return '(' + toString(expectedValue) + ' == ' + value + ')';
        }
    }

    function elementHasText( config, expectedValue ) {
        var display = getViewEditDisplayForConfig(config),
            value = '',
            result = false;

        if ( !display ){
            return 'elementHasText: component not found with ng-model: '+config.model;
        }

        value = display.text().trim();
        result = ( value === toString(expectedValue) );

        if ( result ){
            return true;
        }
        else {
            return '(' + toString(expectedValue) + ' == ' + value + ')';
        }

    }

})( window );


