angular.module('common.csvExport')
    .service('csvExportService', csvExportService);

function csvExportService($q, $window, CarliModules){
    var csvModule = CarliModules.Csv;

    return {
        exportToCsv: exportToCsv,
        browserDownloadCsv: browserDownloadCsv
    };

    function exportToCsv( data, columns ){
        var deferred = $q.defer();

        var csvExportOptions = {
            columns: columns,
            header: true
        };

        csvModule.stringify(data, csvExportOptions, function(err, out) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(out);
            }
        });

        return deferred.promise;
    }

    function browserDownloadCsv( csvString, fileName ){
        var blob = new Blob([csvString], {type: "text/csv;charset=utf-8"});
        //TODO: feature detect saveAs and try a workaround if it's missing, or at least show an error
        $window.saveAs(blob, fileName);
    }

}