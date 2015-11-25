angular.module('library.sections.masquerade')
    .controller('masqueradeController', masqueradeController);

function masqueradeController(config, libraryService) {
    var vm = this;

    vm.libraries = [];

    activate();

    function activate() {
        libraryService.list().then(function (libraries) {
            vm.libraries = libraries.map(libraryWithMasqueradingUrl);
        });

        function libraryWithMasqueradingUrl(library) {
            library.masqueradingUrl = config.masqueradeAsLibraryUrl + '?masquerade-as-library=' + library.id;
            return library;
        }
    }
}
