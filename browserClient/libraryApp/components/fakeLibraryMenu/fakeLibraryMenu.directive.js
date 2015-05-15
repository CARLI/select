angular.module('library.fakeLibraryMenu')
    .directive('fakeLibraryMenu', function ($q, $window, userService, CarliModules) {
        return {
            restrict: 'E',
            templateUrl: '/libraryApp/components/fakeLibraryMenu/fakeLibraryMenu.html',
            link: function (scope) {
                var libraryModule = CarliModules.Library;

                activate();

                function activate() {
                    $q.when(libraryModule.list()).then(function (libraries) {
                        scope.libraryList = libraries;

                        if ($window.sessionStorage.getItem('authToken')) {
                            restoreCurrentLibrary();
                        }
                    });

                    scope.$watch('selectedLibrary', function (newLibrary) {
                        if (newLibrary) {
                            setCurrentLibrary(newLibrary);
                        }
                    });
                }

                function restoreCurrentLibrary() {
                    var libraryId = JSON.parse($window.sessionStorage.getItem('authToken')).libraryId;
                    var filteredLibraries = scope.libraryList.filter(function (library) {
                        return library.id == libraryId;
                    });
                    setCurrentLibrary(filteredLibraries[0]);
                }

                function setCurrentLibrary(library) {
                    var authToken = {
                        userName: library.name + ' User',
                        libraryId: library.id
                    };
                    $window.sessionStorage.setItem('authToken', JSON.stringify(authToken));
                    userService.initializeUserFromToken(authToken);
                }
            }
        };
    });
