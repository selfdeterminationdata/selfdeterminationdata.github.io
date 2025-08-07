import * as server from "./server.js";
import express from "express";
import * as mock from "./server.mock.js";

const app = express();

const allowedOrigins = ["http://localhost:8080"];

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

app.use((req, res, next) => {

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {

    res.header('Access-Control-Allow-Origin', origin);

  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {

    return res.status(200).end();

  }

  next();

});

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
app.post("/periods/groupIDS", server.getPeriodsByGroups);

app.get("/geometries/ccode/:ccode/:year", server.getGeomByCCode);
app.get("/geometries/groupID/:groupID/:year", server.getGeomByGroup);
app.post("/geometries/groupIDS/:year", server.getGeomByGroups);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
