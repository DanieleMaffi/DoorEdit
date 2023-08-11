const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const sql = require("mssql");

const config = require('./config.js');
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

    try {
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

        if (!terminalId)
            res.status(404).render("notfound")

        res.status(200).render('terminal', {
            user: decodedToken['user'],
            terminals: decodedToken['terminals'],
            terminal: terminal
        })
    }
    catch (err) { console.log(err) }
}

exports.manageTerminal = async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    let id = req.params.id

    const pool = await sql.connect(config)

    const anagraphicResult = await pool.query("SELECT * FROM tb_cfg_anagrafica");
    const anagraphic = anagraphicResult.recordset;

    query = "SELECT * FROM vw_autorizzazioni WHERE id_terminale = @id"
    request = pool.request().input('id', sql.BigInt, id).query(query, (err, result) => {
        if (err) console.log(err)

        if (result.rowsAffected == 0)
            res.status(404).render("notfound")
        
        res.status(200).render("manageTerminal", {
            user: decodedToken["user"],
            terminals: decodedToken["terminals"],
            authorizations: result.recordset,
            anagraphic: anagraphic,
            id: id
        })
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
        if(err) console.log(err)

        res.status(200).redirect('/home')

        pool.close()
            .catch((err) => { console.log(err) })
    })
}

exports.addTerminalAccess = async (req, res) => {
    let id = req.params.id
    let person = req.body.person

    const pool = await sql.connect(config)
    let request = pool.request()
    request.input('id', sql.NVarChar, id)
    request.input('person', sql.BigInt, person)

 
    request.query("INSERT INTO tb_cfg_autorizzazioni (id_terminale, id_anagrafica) VALUES (@id, @person)", (err, result) => {
        if(err) {
            console.log(err)
            res.status(500).render("serverError")    //Should be seerver error page
        }
        else
            res.status(200).redirect('/terminals/' + id + '/manage')
    })
}

exports.deleteTerminalAccess = async (req, res) => {
    let terminalId = req.params.terminalId
    let anagraphicId = req.params.personId

    const pool = await sql.connect(config)
    let request = await pool.request()
    request.input('terminal', sql.NVarChar, terminalId)
    request.input('anagraphic', sql.NVarChar, anagraphicId)

    let query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_terminale = @terminal AND id_anagrafica = @anagraphic"

    request.query(query, (err, result) => {
        if(err) console.log(err)

        res.status(200).redirect('/terminals/' + terminalId + '/manage') 

        pool.close()
            .catch((err) => { console.log(err) })
    })
}

//This is not the callback function, it just updates authorizations
exports.updateTerminalAccess = async (terminalId, anagraphicId) => {
    const pool = await sql.connect(config)
    let query = `IF (SELECT COUNT(*) FROM tb_cfg_autorizzazioni WHERE id_terminale = @terminal AND id_anagrafica = @anagraphic) = 0
                BEGIN
                INSERT INTO tb_cfg_autorizzazioni (id_terminale, id_anagrafica) VALUES (@terminal, @anagraphic)
                END
    `
    let request = await pool.request()
    request.input('terminal', sql.NVarChar, terminalId)
    request.input('anagraphic', sql.NVarChar, anagraphicId)

    request.query(query, (err, result) => {
        if(err) console.log(err)

        pool.close()
            .catch((err) => { console.log(err) })
    })

    query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_terminale != @terminal AND id_anagrafica = @anagraphic"
    request.query(query, (err, result) => {
        if(err) console.log(err)

        pool.close()
            .catch((err) => { console.log(err) })
    })
} 

// Removes all the acces to a specified person
exports.removeAccess = async (id) => {
    const pool = await sql.connect(config)
    
    let request = await pool.request()
    request.input('anagraphic', sql.NVarChar, id)

    query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_anagrafica = @anagraphic"
    request.query(query, (err, result) => {
        if(err) console.log(err)

        pool.close()
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
        if(err) console.log(err)

        res.status(200).redirect('/home')

        pool.close()
            .catch((err => {console.log(err)}))
    })
}

exports.deleteTerminal = async (req, res) => {
    let id = req.params.id

    const pool = await sql.connect(config)
    let query = "DELETE tb_cfg_terminali WHERE rowid = @id"
    let request = pool.request()
    request.input('id', sql.BigInt, id)

    request.query(query, (err, result) => {
        if (result.rowsAffected == 0)
            res.status(404).render("notfound")

        res.status(200).redirect('/home')

        pool.close()
            .then(() => { console.log("Closed pool") })
            .catch((err => {console.log(err)}))
    })
}
