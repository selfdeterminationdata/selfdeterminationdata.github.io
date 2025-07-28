const db =  require("./db.js");

const getAllCountries = async (req, res) => {
    const result = await db.query("SELECT * FROM country");

    res.status(200).json(result);
}

module.exports = {
    getAllCountries,
}