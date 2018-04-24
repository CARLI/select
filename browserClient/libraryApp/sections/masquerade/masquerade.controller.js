angular.module('library.sections.masquerade')
    .controller('masqueradeController', masqueradeController);

function masqueradeController(config, libraryService) {
    var vm = this;

    vm.libraries = [];
    vm.libraryAppBrowsingContextId = config.libraryAppBrowsingContextId;

    activate();

    function activate() {
        libraryService.listActiveLibraries().then(function (libraries) {
            vm.libraries = libraries.map(libraryWithMasqueradingUrl);
        });

        function libraryWithMasqueradingUrl(library) {
            library.masqueradingUrl = config.masqueradeAsLibraryUrl + '?masquerade-as-library=' + library.id;
            return library;
        }
    }
}
