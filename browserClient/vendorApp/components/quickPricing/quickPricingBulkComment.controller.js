angular.module('vendor.quickPricing')
    .controller('quickPricingBulkCommentController', quickPricingBulkCommentController);

function quickPricingBulkCommentController() {
    var vm = this;

    vm.addComment = false;

    vm.toggleComment = toggleComment;

    activate();

    function activate() {
    }

    function toggleComment(){
        vm.addComment = !vm.addComment;
        vm.quickPricingArguments.addComment = vm.addComment;
    }
}
