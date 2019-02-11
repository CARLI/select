

const email = require("../components/email");

email.sendTestEmail("bryan@pixotech.com")
    .then((result) => {
        console.log("Success");
        console.log(result);
    })
    .catch((e) => {
        console.log("Failure");
        console.log(e);
    });
