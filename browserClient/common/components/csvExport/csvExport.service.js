angular.module('common.csvExport')
    .service('csvExportService', csvExportService);

function csvExportService($q, $window, CarliModules, browserDownloadService){
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
        browserDownloadService.browserDownload(ensureFilenameHasExtension(fileName), 'text/csv;charset=utf-8', csvString);
    }

    function ensureFilenameHasExtension(fileName) {
        return fileName.endsWith(".csv") ? fileName : fileName + ".csv";
    }

}
