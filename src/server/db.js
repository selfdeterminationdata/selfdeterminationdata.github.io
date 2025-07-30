import {Connector} from '@google-cloud/cloud-sql-connector';
import {Pool} from "pg";
import 'dotenv/config';
//const { Connector } = require("@google-cloud/cloud-sql-connector");
//const { Pool } = require("pg");
//require("dotenv").config();

const connector = new Connector();
const clientOpts = await connector.getOptions({
  instanceConnectionName: 'unique-antonym-466108-j0:europe-west1:determination-backend',
  ipType: 'PUBLIC',
});
const pool = await new Pool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:"postgres",
});

export const query = (text, params) => pool.query(text, params);