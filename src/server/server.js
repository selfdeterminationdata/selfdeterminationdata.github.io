import {query} from "./db.js";
//const db =  require("./db.js");

export const getAllCountries = async (req, res) => {
    const result = await query("SELECT * FROM country;");

    res.status(200).json(result.rows);
}

export const getCountryByCode = async (req, res) => {
    const result = await query("SELECT * FROM country WHERE ccode = $1;", [req.params['ccode']]);

    res.status(200).json(result.rows);
}

export const getGroupByID = async (req, res) => {
    const result = await query("SELECT * FROM groups WHERE groupID = $1;", [req.params['id']]);

    res.status(200).json(result.rows);
}

export const getGroupByCCode = async (req, res) => {
    const result = await query("SELECT * FROM groups WHERE ccode = $1;", [req.params['ccode']]);

    res.status(200).json(result.rows);
}

export const getPeriodsByGroup = async (req, res) => {
    const result = await query("SELECT * FROM period WHERE groupID = $1;", [req.params['groupID']]);

    res.status(200).json(result.rows);
}

export const getPeriodsByCCode = async (req, res) => {
    const result = await query("SELECT * FROM period WHERE groupID = $1;" [req.params['groupID']]);

    res.status(200).json(result.rows);
}

export const getPeriodsByGroups = async (req, res) => {
    let inputs = [];
    let index = 1;
    for (index; index < req.body['groupIDS'].length + 1; index++){
        inputs.push("$" + index);
    }
    inputs = inputs.join(", ");

    let sql = "SELECT * FROM period JOIN groups ON period.groupid = groups.groupid WHERE period.groupID IN (" + inputs + ");";

    const result = await query(sql, [...req.body['groupIDS']]);

    res.status(200).json(result.rows);
}

export const getGeomByCCode = async (req, res) => {
    const result = await query(
    "SELECT geometries.geoID, ST_AsGeoJSON(geometries.geom) as multiPoly FROM geometries JOIN period ON geometries.geoID = period.geoID JOIN country ON period.ccode = country.ccode WHERE period.ccode = $1 AND period.minyear <= $2 AND period.maxyear >= $2;",
    [req.params['ccode'], req.params['year']]);

    res.status(200).json(result.rows);
}

export const getGeomByGroup = async (req, res) => {
    const result = await query(
    "SELECT geometries.geoID, ST_AsGeoJSON(geometries.geom) as multiPoly FROM geometries JOIN period ON geometries.geoID = period.geoID JOIN groups ON period.groupID = groups.groupId WHERE period.groupID = $1 AND period.minyear <= $2 AND period.maxyear >= $2;",
    [req.params['groupID'], req.params['year']]);

    res.status(200).json(result.rows);
}

export const getGeomByGroups = async (req, res) => {
    let inputs = [];
    let index = 1;
    for (index; index < req.body['groupIDS'].length + 1; index++){
        inputs.push("$" + index);
    }
    inputs = inputs.join(", ");

    let sql = "SELECT geometries.geoID, ST_AsGeoJSON(geometries.geom) as multiPoly, groups.groupname FROM geometries JOIN period ON geometries.geoID = period.geoID JOIN groups ON period.groupID = groups.groupId WHERE period.groupID IN ("
               + inputs
               + ") AND period.minyear <= $"
               + (index)
               + " AND period.maxyear >= $"
               + (index) + ";";

    const result = await query(sql, [...req.body['groupIDS'], req.params['year']]);

    res.status(200).json(result.rows);
}