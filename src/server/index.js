const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mock = require("./server.mock");
const app = express();
const port = 3000;

app.use(cors({ origin: "http://localhost:8080" }));

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.get("/", (request, response) => {
    response.json({info: "Node.js, Express, and Postgres API"});
});

app.get("/group/700010", mock.getGroupByID);
app.get("/group/geom/101010", mock.getGroupGeom);
app.get("/countries", mock.getAllCountries);
app.get("/countries/:ccode", mock.getCountryByCode)

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
