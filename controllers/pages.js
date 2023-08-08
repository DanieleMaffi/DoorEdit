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

//When the corresponding url is called, loads the page associated with the terminal given as a parameter in the uri ex: /terminals/12
exports.loadTerminal = async (req, res) => {
    let terminalSqlId = req.params.id

    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    let terminals = decodedToken['terminals']
    let terminalIp = ""
    //This is not to be confused with the other id, which corresponds to the actaul dtabase id
    let terminalId = 0
    let terminalState = 0

    let terminalName = ""

    //Looking among the terminals array which has the id corresponding to the uri
    for (let i = 0; i < terminals.length; i++) 
        if (terminals[i].rowID == terminalSqlId) {
            terminalIp = terminals[i].Indirizzo_Terminale
            terminalId = terminals[i].ID_Terminale
            terminalName = terminals[i].Nome_Terminale
            terminalState = terminals[i].Stato
        }

    //The object that contains the spicified terminal to edit
    let terminal = {
        id: terminalId,
        ip: terminalIp,
        name: terminalName,
        sqlId: terminalSqlId,
        state: terminalState
    }

    res.status(200).render('terminal', {
        id: decodedToken['id'],
        user: decodedToken['user'],
        terminals: decodedToken['terminals'],
        terminal: terminal
    })
}

exports.updateTerminal = async (req, res) => {
    let sqlId = req.params.id
    let name = req.body.name
    let ip = req.body.ip
    let id = req.body.id

    const pool = await sql.connect(config)
    let query = "UPDATE tb_cfg_terminali SET nome_terminale = @name, id_terminale =  @id, indirizzo_terminale = @ip WHERE rowid = @sqlId"
    let request = await pool.request()
    request.input('sqlId', sql.BigInt, sqlId)
    request.input('name', sql.NVarChar, name)
    request.input('ip', sql.NVarChar, ip)
    request.input('id', sql.NVarChar, id)

    request.query(query, (err, result) => {
        console.log(err)
        res.status(200).redirect('/home')

        pool.close()
            .then(() => { console.log('Closed pool') })
            .catch((err) => { console.log(err) })
    })
}

exports.loadNewTerminal = async (req,  res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET)

    res.status(200).render('newTerminal', {
        user: decodedToken['user'],
        id: decodedToken['id'],
        terminals: decodedToken['terminals'],
    })
}

exports.addTerminal = async (req, res) => {
    let name = req.body.name
    let id = req.body.id
    let ip = req.body.ip

    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET)

    const pool = await sql.connect(config)
    let query = "INSERT INTO tb_cfg_terminali (nome_terminale, id_terminale, indirizzo_terminale) VALUES (@name, @id, @ip)"
    let request = pool.request()

    request.input('name', sql.NVarChar, name)
    request.input('id', sql.NVarChar, id)
    request.input('ip', sql.NVarChar, ip)

    request.query(query, (err, result) => {
        res.status(200).redirect('/home')

        pool.close()
            .then(() => { console.log("Closed pool") })
            .catch((err => {console.log(err)}))
    })
}

//TODO
exports.loadAnagraphic = async (req, res) => {
    const pool = await sql.connect(config)
    let query = "SELECT * FROM tabella angrafica"
}