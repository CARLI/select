angular.module('carli.licenseService')
    .service('licenseService', licenseService);

function licenseService( CarliModules, $q, errorHandler ) {

    var licenseModule = CarliModules.License;

    function getOfferingTypeOptionsForAngularController(){
        var options = licenseModule.getOfferingTypeOptions();
        var results = [];

        options.forEach(function(val){
            results.push(
                {
                    label: val,
                    value: val
                }
            );
        });

        return results;
    }

    return {
        list:   function() { return $q.when( licenseModule.list() ).catch(errorHandler); },
        create: function() { return $q.when( licenseModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( licenseModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( licenseModule.load.apply(this, arguments) ).catch(errorHandler); },
        listLicensesForVendorId: function(){
            return $q.when( licenseModule.listLicensesForVendorId.apply(this, arguments) ).catch(errorHandler);
        },
        getOfferingTypeOptions: getOfferingTypeOptionsForAngularController
    };
}
