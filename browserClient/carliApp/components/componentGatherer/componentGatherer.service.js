angular.module('carli.componentGatherer')
    .service('componentGatherer', componentGatherer);

    function componentGatherer($http) {

        function gatherComponents(examples, basePath) {
            var components = [];
            angular.forEach(examples, function (templateName, title) {
                components.push(gatherComponent(title, templateName, basePath));
            });
            return components;
        }

        function gatherComponent(title, templateName, basePath) {
            var component = { title: title, templateUrl: basePath + templateName };
            $http.get(component.templateUrl).success(function (source) {
                component.source = source;
            });
            return component;
        }

        return { gather: gatherComponents };
    }

