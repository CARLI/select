const Q = require('q');
const pdf = require('html-pdf');

function exportTestPdf() {
    // const options = {
    //     header: {
    //         height: '21mm'
    //     },
    //     footer: {
    //         height: '5mm',
    //         contents: '<span>Page {{page}} / {{pages}}</span>'
    //     }
    // };

    return contentForPdf()
        .then(function (contentForPdfResult) {
            const pdfPromise = Q.defer();

            const thePdf = pdf.create(contentForPdfResult.html);
            console.log("thePdf:");
            console.log(thePdf);
            thePdf.toFile("/tmp/test-carli.pdf", function (err, result) {
                if (err) {
                    pdfPromise.reject(err);
                } else {
                    pdfPromise.resolve(result);
                }
            });

            // pdf.create(contentForPdfResult.html, options).toBuffer(function (err, result) {
            //     if (err) {
            //         pdfPromise.reject(err);
            //     } else {
            //         pdfPromise.resolve({
            //             pdf: result,
            //             fileName: contentForPdfResult.fileName
            //         });
            //     }
            // });

            return pdfPromise.promise;
        });
}

function contentForPdf() {
    const p = Q.defer();
    p.resolve({
        fileName: 'hello-world.pdf',
        html: '<html>'+
            '<head><title>Hello World</title></head>' +
            '<body><h1>Hello World</h1></body>' +
            '</html>'
    });
    return p.promise;
}

exportTestPdf()
    .then((result) => {
        console.log("Success?");
        console.log(result);
    })
    .catch((err) => {
        console.log("An error occurred");
        console.log(err);
    });