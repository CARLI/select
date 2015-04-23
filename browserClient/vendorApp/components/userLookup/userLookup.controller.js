angular.module('vendor.userLookup')
    .controller('userLookupController', userLookupController);

function userLookupController(){
    var vm = this;

    activate();

    function activate(){
        //var userToken = $window.sessionStorage.getItem('currentVendorId');
        //userLookup.initializeUserFromToken(userToken);
    }
}
