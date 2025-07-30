import * as server from "./server.js";
import express from "express";
import * as mock from "./server.mock.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

app.get("/", (request, response) => {
    response.json({info: "Node.js, Express, and Postgres API"});
});

app.get("/groups/id/:id", server.getGroupByID);
app.get("/groups/geom/101010", mock.getGroupGeom);
app.get("/groups/country/:ccode", server.getGroupByCCode);

app.get("/countries", server.getAllCountries);
app.get("/countries/:ccode", server.getCountryByCode);

app.get("/periods/groupID/:groupID", server.getPeriodsByGroup);
app.get("/periods/ccode/:ccode", server.getPeriodsByCCode);

app.get("/geometries/ccode/:ccode/:year", server.getGeomByCCode);
app.get("/geometries/groupID/:groupID/:year", server.getGeomByGroup);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
