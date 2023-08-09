const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const sql = require("mssql");

var config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB,
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
};

exports.loadHome = async (req, res) => {

    //Decoding the token drom the cookies in the browser, this is done in order to get the ID nad username of the user
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

    const pool = await sql.connect(config);

    let query = `SELECT * FROM tb_cfg_terminali`

    sql.query(query, (err, result) => {

        let payload = {
            id: decodedToken['id'],
            user: decodedToken['user'],
            terminals: result.recordset
        } 
        let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { path: '/' })


        res.status(200).render("home", {
            user: decodedToken['user'],
            terminals: result.recordset
        })
    
        pool.close()
            .then(() => { console.log('Closed pool') })
            .catch((err) => { console.log(err) })
    })
}

//TODO
exports.loadAnagraphic = async (req, res) => {
    const pool = await sql.connect(config)
    let query = "SELECT * FROM"
}