const https = require("https");

const start = Date.now();

function makeRequest() {
    https.request("https://www.google.com", res => {
        res.on("data", () => {

        });

        res.on("end", () => {
            console.log(Date.now() - start);
        });
    })
        .end();
}

for (let i = 0; i < 13; i++) {
    makeRequest();
}
