const https = require("https");
const crypto = require("crypto");
const fs = require("fs");

const start = Date.now();

function makeRequest() {
    https.request("https://www.google.com", res => {
        res.on("data", () => {

        });

        res.on("end", () => {
            console.log("Request:", Date.now() - start);
        });
    })
        .end();
}

function makeHash() {
    crypto.pbkdf2("a", "b", 100000, 512, "sha512", () => {
        console.log("Hash:", Date.now() - start);
    });
}

makeRequest();

fs.readFile("multitask.js", "utf8", () => {
    console.log("FS:", Date.now() - start);
});

// for (let i = 0; i < 100000; i++) {
//     makeHash();
// }

makeHash();
makeHash();
makeHash();
makeHash();
