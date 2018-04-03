const Worker = require("webworker-threads").Worker;
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    const worker = new Worker(function () {
        this.onmessage = function () {
            let counter = 0;

            while (counter < 1e10) {
                counter++;
            }

            postMessage(counter);
        };
    });

    worker.onmessage = function (message) {
        res.send(message);
    };

    worker.postMessage();
});

app.get("/fast", (req, res) => {
    res.send("This was fast");
});

app.listen(3000);

